#!/bin/bash

# Script de deployment para producción
# Uso: ./deploy.sh [ambiente]

set -e  # Exit on any error

ENVIRONMENT=${1:-production}
echo "🚀 Iniciando deployment para ambiente: $ENVIRONMENT"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para logging
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
    exit 1
}

warn() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    error "No se encontró package.json. Asegúrate de estar en el directorio raíz del proyecto."
fi

# Verificar Node.js version
NODE_VERSION=$(node --version)
log "Node.js version: $NODE_VERSION"

if ! node -e "process.exit(parseInt(process.version.slice(1)) >= 18 ? 0 : 1)"; then
    error "Node.js 18+ requerido. Versión actual: $NODE_VERSION"
fi

# Verificar npm version
NPM_VERSION=$(npm --version)
log "npm version: $NPM_VERSION"

# Backend deployment
log "📦 Preparando backend..."
cd backend

# Verificar archivo .env
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        warn "Archivo .env no encontrado. Copiando desde .env.example"
        cp .env.example .env
        warn "⚠️  IMPORTANTE: Configura las variables en .env antes de continuar"
    else
        error "No se encontró .env ni .env.example"
    fi
fi

# Instalar dependencias del backend
log "📥 Instalando dependencias del backend..."
npm ci --only=production

# Verificar conexión a la base de datos
log "🔍 Verificando conexión a la base de datos..."
if node -e "
const { pool } = require('./db.js');
pool.getConnection()
  .then(conn => {
    console.log('✅ Conexión a BD exitosa');
    conn.release();
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error de conexión a BD:', err.message);
    process.exit(1);
  });
"; then
    log "Base de datos conectada correctamente"
else
    error "Error de conexión a la base de datos. Verifica la configuración."
fi

# Crear directorios necesarios
log "📁 Creando directorios necesarios..."
mkdir -p logs
mkdir -p temp
mkdir -p uploads

# Configurar permisos
chmod 755 logs
chmod 755 temp
chmod 755 uploads

# Volver al directorio raíz
cd ..

# Frontend deployment
log "🎨 Preparando frontend..."
cd frontend

# Verificar configuración del frontend
if [ ! -f "src/config.js" ]; then
    warn "Archivo de configuración del frontend no encontrado"
fi

# Instalar dependencias del frontend
log "📥 Instalando dependencias del frontend..."
npm ci

# Build del frontend
log "🔨 Compilando frontend para producción..."
npm run build

# Verificar que el build fue exitoso
if [ ! -d "dist" ]; then
    error "Error en el build del frontend. Directorio 'dist' no encontrado."
fi

log "✅ Build del frontend completado"

# Volver al directorio raíz
cd ..

# Configuraciones adicionales para producción
log "⚙️  Configurando para producción..."

# Crear archivo de configuración de PM2 (si se usa)
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'elijeser-backend',
    script: './backend/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './backend/logs/pm2-error.log',
    out_file: './backend/logs/pm2-out.log',
    log_file: './backend/logs/pm2-combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max_old_space_size=4096'
  }]
};
EOF

log "✅ Archivo PM2 creado"

# Crear script de inicio
cat > start.sh << 'EOF'
#!/bin/bash

echo "🚀 Iniciando ElijeSer..."

# Verificar PM2
if ! command -v pm2 &> /dev/null; then
    echo "PM2 no encontrado. Instalando..."
    npm install -g pm2
fi

# Iniciar aplicación con PM2
pm2 start ecosystem.config.js

# Configurar PM2 para auto-start
pm2 startup
pm2 save

echo "✅ ElijeSer iniciado correctamente"
echo "📊 Monitoreo: pm2 monit"
echo "📋 Logs: pm2 logs"
echo "🔄 Restart: pm2 restart elijeser-backend"
EOF

chmod +x start.sh

# Crear script de monitoreo
cat > monitor.sh << 'EOF'
#!/bin/bash

echo "📊 Estado de ElijeSer"
echo "===================="

# Estado de PM2
if command -v pm2 &> /dev/null; then
    echo "🔍 Procesos PM2:"
    pm2 list
    echo ""
fi

# Estado del sistema
echo "💾 Uso de memoria:"
free -h
echo ""

echo "💽 Uso de disco:"
df -h
echo ""

echo "⚡ Carga del sistema:"
uptime
echo ""

# Health check de la aplicación
echo "🏥 Health check de la aplicación:"
if curl -s http://localhost:3000/health > /dev/null; then
    echo "✅ Backend: OK"
else
    echo "❌ Backend: ERROR"
fi

# Logs recientes
echo ""
echo "📝 Logs recientes (últimas 10 líneas):"
if [ -f "./backend/logs/combined.log" ]; then
    tail -10 ./backend/logs/combined.log
else
    echo "No se encontraron logs"
fi
EOF

chmod +x monitor.sh

# Crear script de backup
cat > backup.sh << 'EOF'
#!/bin/bash

BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="elijeser_backup_$DATE"

echo "💾 Creando backup: $BACKUP_NAME"

# Crear directorio de backup
mkdir -p $BACKUP_DIR

# Backup de la base de datos (si MySQL)
if [ ! -z "$DB_NAME" ]; then
    echo "📊 Backup de base de datos..."
    mysqldump -u $DB_USER -p$DB_PASSWORD $DB_NAME > $BACKUP_DIR/${BACKUP_NAME}_db.sql
fi

# Backup de archivos
echo "📁 Backup de archivos..."
tar -czf $BACKUP_DIR/${BACKUP_NAME}_files.tar.gz \
    --exclude=node_modules \
    --exclude=dist \
    --exclude=logs \
    --exclude=backups \
    .

echo "✅ Backup completado: $BACKUP_DIR/$BACKUP_NAME"

# Limpiar backups antiguos (mantener solo los últimos 5)
cd $BACKUP_DIR
ls -t elijeser_backup_* | tail -n +6 | xargs -r rm

echo "🧹 Backups antiguos limpiados"
EOF

chmod +x backup.sh

# Health check script
cat > healthcheck.sh << 'EOF'
#!/bin/bash

# Script de health check para monitoreo externo
# Retorna 0 si todo está OK, 1 si hay problemas

BACKEND_URL="http://localhost:3000"
LOG_FILE="./backend/logs/healthcheck.log"

# Función de logging
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" >> $LOG_FILE
}

# Health check del backend
if curl -s -f $BACKEND_URL/health > /dev/null; then
    log "✅ Backend health check OK"
    BACKEND_OK=1
else
    log "❌ Backend health check FAILED"
    BACKEND_OK=0
fi

# Health check de la base de datos
if curl -s -f $BACKEND_URL/health/db > /dev/null; then
    log "✅ Database health check OK"
    DB_OK=1
else
    log "❌ Database health check FAILED"
    DB_OK=0
fi

# Verificar uso de memoria (alerta si >80%)
MEM_USAGE=$(free | grep Mem | awk '{printf("%.0f", $3/$2 * 100.0)}')
if [ $MEM_USAGE -gt 80 ]; then
    log "⚠️  High memory usage: ${MEM_USAGE}%"
    MEM_OK=0
else
    log "✅ Memory usage OK: ${MEM_USAGE}%"
    MEM_OK=1
fi

# Verificar espacio en disco (alerta si >85%)
DISK_USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 85 ]; then
    log "⚠️  High disk usage: ${DISK_USAGE}%"
    DISK_OK=0
else
    log "✅ Disk usage OK: ${DISK_USAGE}%"
    DISK_OK=1
fi

# Resultado final
if [ $BACKEND_OK -eq 1 ] && [ $DB_OK -eq 1 ] && [ $MEM_OK -eq 1 ] && [ $DISK_OK -eq 1 ]; then
    log "✅ All systems OK"
    exit 0
else
    log "❌ System issues detected"
    exit 1
fi
EOF

chmod +x healthcheck.sh

# Crear crontab para tareas automáticas
cat > crontab.txt << 'EOF'
# ElijeSer Cron Jobs
# Backup diario a las 2:00 AM
0 2 * * * /path/to/elijeser/backup.sh >> /path/to/elijeser/backend/logs/backup.log 2>&1

# Health check cada 5 minutos
*/5 * * * * /path/to/elijeser/healthcheck.sh

# Limpiar logs antiguos cada domingo a las 3:00 AM
0 3 * * 0 find /path/to/elijeser/backend/logs -name "*.log" -mtime +30 -delete

# Restart semanal (domingo 4:00 AM)
0 4 * * 0 pm2 restart elijeser-backend
EOF

log "📅 Archivo crontab.txt creado. Para activar: crontab crontab.txt"

# Configuración de firewall (ejemplo para Ubuntu/Debian)
cat > firewall-setup.sh << 'EOF'
#!/bin/bash

echo "🔥 Configurando firewall..."

# Configurar UFW (Ubuntu Firewall)
if command -v ufw &> /dev/null; then
    # Reset UFW
    ufw --force reset
    
    # Políticas por defecto
    ufw default deny incoming
    ufw default allow outgoing
    
    # Permitir SSH
    ufw allow ssh
    
    # Permitir HTTP y HTTPS
    ufw allow 80/tcp
    ufw allow 443/tcp
    
    # Permitir puerto de la aplicación (solo si es necesario)
    # ufw allow 3000/tcp
    
    # Activar firewall
    ufw --force enable
    
    echo "✅ Firewall configurado"
    ufw status verbose
else
    echo "⚠️  UFW no encontrado. Configura el firewall manualmente."
fi
EOF

chmod +x firewall-setup.sh

# Finalización
log "🎉 Deployment completado exitosamente!"
log ""
log "📋 Próximos pasos:"
log "1. Verificar configuración en backend/.env"
log "2. Ejecutar: ./start.sh para iniciar la aplicación"
log "3. Configurar nginx/apache como reverse proxy"
log "4. Configurar SSL/TLS"
log "5. Configurar cron jobs: crontab crontab.txt"
log "6. Configurar firewall: ./firewall-setup.sh"
log ""
log "🔧 Scripts disponibles:"
log "- ./start.sh: Iniciar aplicación"
log "- ./monitor.sh: Monitorear sistema"
log "- ./backup.sh: Crear backup"
log "- ./healthcheck.sh: Verificar salud"
log ""
log "📊 Monitoreo:"
log "- Health: http://localhost:3000/health"
log "- Metrics: http://localhost:3000/metrics"
log "- PM2: pm2 monit"
log ""
log "✅ ElijeSer está listo para producción!"
