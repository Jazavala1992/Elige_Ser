import winston from 'winston';
import { pool } from '../db.js';

class MonitoringService {
  constructor() {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      transports: [
        new winston.transports.File({ filename: './logs/monitoring.log' }),
        new winston.transports.Console()
      ]
    });

    this.metrics = {
      requests: 0,
      errors: 0,
      databaseConnections: 0,
      responseTime: []
    };
  }

  // Verificar salud del sistema
  async healthCheck() {
    const health = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      database: 'disconnected',
      version: process.env.npm_package_version || '1.0.0'
    };

    try {
      // Verificar conexión a base de datos
      const connection = await pool.getConnection();
      await connection.execute('SELECT 1');
      connection.release();
      health.database = 'connected';
    } catch (error) {
      health.status = 'ERROR';
      health.database = 'error';
      health.databaseError = error.message;
      this.logger.error('Database health check failed', { error: error.message });
    }

    return health;
  }

  // Métricas del sistema
  getMetrics() {
    return {
      ...this.metrics,
      avgResponseTime: this.metrics.responseTime.length > 0 
        ? this.metrics.responseTime.reduce((a, b) => a + b, 0) / this.metrics.responseTime.length 
        : 0,
      errorRate: this.metrics.requests > 0 ? (this.metrics.errors / this.metrics.requests) * 100 : 0
    };
  }

  // Registrar request
  logRequest(req, res, responseTime) {
    this.metrics.requests++;
    this.metrics.responseTime.push(responseTime);

    // Mantener solo los últimos 1000 tiempos de respuesta
    if (this.metrics.responseTime.length > 1000) {
      this.metrics.responseTime = this.metrics.responseTime.slice(-1000);
    }

    if (res.statusCode >= 400) {
      this.metrics.errors++;
    }

    this.logger.info('Request processed', {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      responseTime: `${responseTime}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
  }

  // Registrar error
  logError(error, req = null) {
    this.metrics.errors++;
    
    const errorLog = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    };

    if (req) {
      errorLog.request = {
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        body: req.method === 'POST' || req.method === 'PUT' ? req.body : undefined
      };
    }

    this.logger.error('Application error', errorLog);
  }

  // Verificar recursos del sistema
  checkSystemResources() {
    const memUsage = process.memoryUsage();
    const memUsagePercentage = (memUsage.heapUsed / memUsage.heapTotal) * 100;

    if (memUsagePercentage > 80) {
      this.logger.warn('High memory usage detected', {
        percentage: memUsagePercentage.toFixed(2),
        heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`
      });
    }

    return {
      memory: {
        usage: memUsagePercentage.toFixed(2),
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
        external: Math.round(memUsage.external / 1024 / 1024)
      },
      uptime: process.uptime()
    };
  }

  // Limpiar logs antiguos (se puede programar como tarea cron)
  async cleanOldLogs(daysToKeep = 30) {
    try {
      // Esta función se puede implementar para limpiar logs antiguos
      this.logger.info('Log cleanup initiated', { daysToKeep });
      // Implementar lógica de limpieza aquí
    } catch (error) {
      this.logger.error('Log cleanup failed', { error: error.message });
    }
  }

  // Alertas del sistema
  async checkAlerts() {
    const alerts = [];
    
    // Verificar tasa de error
    const errorRate = this.getMetrics().errorRate;
    if (errorRate > 10) {
      alerts.push({
        type: 'HIGH_ERROR_RATE',
        message: `Tasa de error alta: ${errorRate.toFixed(2)}%`,
        severity: 'warning'
      });
    }

    // Verificar tiempo de respuesta promedio
    const avgResponseTime = this.getMetrics().avgResponseTime;
    if (avgResponseTime > 2000) {
      alerts.push({
        type: 'SLOW_RESPONSE_TIME',
        message: `Tiempo de respuesta lento: ${avgResponseTime.toFixed(2)}ms`,
        severity: 'warning'
      });
    }

    // Verificar conexiones de base de datos
    try {
      await pool.getConnection().then(conn => conn.release());
    } catch (error) {
      alerts.push({
        type: 'DATABASE_CONNECTION_ERROR',
        message: 'Error de conexión a base de datos',
        severity: 'critical'
      });
    }

    return alerts;
  }
}

export default new MonitoringService();
