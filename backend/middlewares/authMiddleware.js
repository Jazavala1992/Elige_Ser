import jwt from "jsonwebtoken";
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: './logs/auth.log' }),
    new winston.transports.Console()
  ]
});

export const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1]; // Obtén el token del encabezado

    if (!token) {
        logger.warn('Access denied - No token provided', { 
            ip: req.ip, 
            url: req.url,
            userAgent: req.get('User-Agent')
        });
        return res.status(403).json({ message: "Token no proporcionado" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret_key"); // Verifica el token
        req.userId = decoded.id; 
        req.user = decoded;
        
        logger.info('User authenticated successfully', { 
            userId: decoded.id,
            url: req.url 
        });
        next(); 
    } catch (error) {
        logger.warn('Token verification failed', { 
            error: error.message,
            ip: req.ip,
            url: req.url
        });
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: "Token expirado" });
        }
        
        return res.status(401).json({ message: "Token inválido o expirado" });
    }
};

export const optionalAuth = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return next(); // Continúa sin autenticación
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret_key");
        req.user = decoded;
        req.userId = decoded.id;
    } catch (error) {
        // En autenticación opcional, ignoramos errores de token
        logger.debug('Optional auth failed', { error: error.message });
    }
    
    next();
};

export const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ 
                success: false, 
                message: 'Autenticación requerida' 
            });
        }

        if (!roles.includes(req.user.role)) {
            logger.warn('Access denied - Insufficient permissions', {
                userId: req.user.id,
                userRole: req.user.role,
                requiredRoles: roles,
                url: req.url
            });
            
            return res.status(403).json({ 
                success: false, 
                message: 'Permisos insuficientes' 
            });
        }

        next();
    };
};

export default verifyToken;