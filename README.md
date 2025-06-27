# ElijeSer - Sistema de Salud y Bienestar

## 🚀 Descripción del Proyecto

ElijeSer es una aplicación web completa para el seguimiento y gestión de salud y bienestar, compuesta por un backend robusto en Node.js/Express y un frontend moderno en React.

## 📋 Características Principales

### Backend
- ✅ **Arquitectura Escalable**: Separación de responsabilidades con controladores, servicios y middlewares
- ✅ **Seguridad Avanzada**: Helmet, rate limiting, validación de datos, sanitización
- ✅ **Base de Datos Optimizada**: Pool de conexiones MySQL optimizado para producción
- ✅ **Logging Estructurado**: Winston con archivos de log rotativos
- ✅ **Monitoreo y Métricas**: Sistema de health checks y alertas
- ✅ **Manejo Global de Errores**: Middleware centralizado para manejo de errores
- ✅ **Validación Robusta**: express-validator con sanitización automática
- ✅ **Autenticación JWT**: Tokens seguros con refresh automático

### Frontend
- ✅ **PWA Ready**: Service Worker, cache offline, installable
- ✅ **Lazy Loading**: Componentes y rutas cargadas bajo demanda
- ✅ **Cache Híbrido**: Sistema de cache multinivel (memoria, localStorage, SW)
- ✅ **Optimización de Imágenes**: Lazy loading, placeholders, optimización automática
- ✅ **Error Boundaries**: Manejo elegante de errores en componentes
- ✅ **Performance**: Code splitting, chunking optimizado, preload inteligente

## 🏗️ Arquitectura del Sistema

```
ElijeSer/
├── backend/
│   ├── controllers/         # Lógica de controladores
│   ├── services/           # Lógica de negocio
│   ├── middlewares/        # Middlewares de validación y autenticación
│   ├── routes/             # Definición de rutas
│   ├── logs/               # Archivos de log
│   └── index.js           # Servidor principal
└── frontend/
    ├── src/
    │   ├── components/     # Componentes reutilizables
    │   ├── hooks/          # Hooks personalizados
    │   ├── services/       # Servicios y cache
    │   ├── context/        # Context API
    │   └── pages/          # Páginas de la aplicación
    └── public/
```

## 🛠️ Tecnologías Utilizadas

### Backend
- **Node.js + Express**: Servidor web
- **MySQL2**: Base de datos con pool de conexiones
- **Winston**: Logging estructurado
- **Helmet**: Seguridad HTTP
- **express-rate-limit**: Rate limiting
- **express-validator**: Validación y sanitización
- **bcrypt**: Hashing de contraseñas
- **jsonwebtoken**: Autenticación JWT
- **compression**: Compresión gzip

### Frontend
- **React 19**: Framework de interfaz
- **Vite**: Build tool optimizado
- **React Router**: Navegación
- **Axios**: Cliente HTTP
- **Bootstrap + Reactstrap**: UI/UX
- **Recharts**: Gráficos y visualizaciones
- **Workbox**: Service Worker y PWA

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js 18+
- MySQL 8.0+
- npm o yarn

### Backend Setup

1. **Instalar dependencias**:
```bash
cd backend
npm install
```

2. **Configurar variables de entorno**:
```bash
cp .env.example .env
# Editar .env con tus configuraciones
```

3. **Configurar base de datos**:
```sql
CREATE DATABASE elijeser;
-- Ejecutar scripts de creación de tablas
```

4. **Iniciar servidor**:
```bash
# Desarrollo
npm run dev

# Producción
npm start
```

### Frontend Setup

1. **Instalar dependencias**:
```bash
cd frontend
npm install
```

2. **Configurar API URL**:
```javascript
// src/config.js
export default {
  API_BASE_URL: 'http://localhost:3000' // o tu URL de producción
};
```

3. **Iniciar aplicación**:
```bash
# Desarrollo
npm run dev

# Build para producción
npm run build
```

## 📊 Mejoras de Rendimiento Implementadas

### Backend Optimizations

1. **Pool de Conexiones Optimizado**:
```javascript
connectionLimit: 10,
acquireTimeout: 60000,
timeout: 60000,
reconnect: true
```

2. **Rate Limiting**:
- General: 100 requests/15min
- Auth: 5 attempts/15min
- IP-based blocking

3. **Compression & Security**:
- Gzip compression
- Helmet security headers
- CORS configurado
- Request size limits

4. **Structured Logging**:
```javascript
// Logs por nivel: error, warn, info, debug
// Archivos rotativos
// Métricas de performance
```

### Frontend Optimizations

1. **Code Splitting**:
```javascript
// vite.config.js
manualChunks: {
  vendor: ['react', 'react-dom'],
  router: ['react-router-dom'],
  ui: ['bootstrap', 'reactstrap'],
  charts: ['recharts']
}
```

2. **Cache Strategy**:
- Memory cache (5min TTL)
- LocalStorage cache (24h TTL)
- Service Worker cache (offline)

3. **Lazy Loading**:
- Route-based code splitting
- Image lazy loading
- Component lazy loading

## 🔒 Seguridad Implementada

### Backend Security
- **Helmet**: Security headers
- **Rate Limiting**: Prevención de ataques DDoS
- **Input Validation**: Validación y sanitización completa
- **SQL Injection Prevention**: Prepared statements
- **JWT Security**: Tokens con expiración
- **CORS**: Orígenes permitidos configurados

### Frontend Security
- **Content Security Policy**: Configurado via Helmet
- **XSS Prevention**: Sanitización de inputs
- **Secure Storage**: Tokens en httpOnly cookies (recomendado)
- **Input Validation**: Validación client-side

## 📈 Monitoreo y Logging

### Health Checks
```bash
# Salud general del sistema
GET /health

# Métricas de rendimiento
GET /metrics

# Alertas del sistema
GET /alerts
```

### Logs Estructurados
```javascript
// Logs disponibles:
logs/error.log      // Solo errores
logs/combined.log   // Todos los eventos
logs/auth.log       // Eventos de autenticación
logs/monitoring.log // Métricas del sistema
```

## 🧪 Testing (Pendiente)

```bash
# Tests unitarios
npm test

# Tests de integración
npm run test:integration

# Coverage
npm run test:coverage
```

## 📱 PWA Features

- **Installable**: Puede instalarse como app nativa
- **Offline Support**: Funciona sin conexión
- **Background Sync**: Sincronización en background
- **Push Notifications**: Notificaciones push (futuro)

## 🔧 Scripts Disponibles

### Backend
```bash
npm start          # Producción
npm run dev        # Desarrollo con nodemon
npm run logs       # Ver logs en tiempo real
npm run health     # Check de salud del sistema
```

### Frontend
```bash
npm run dev        # Servidor de desarrollo
npm run build      # Build de producción
npm run preview    # Preview del build
npm run lint       # Linting del código
```

## 🚨 Troubleshooting

### Problemas Comunes

1. **Error de conexión a BD**:
```bash
# Verificar configuración en .env
# Verificar que MySQL esté ejecutándose
# Revisar logs/error.log
```

2. **Error 429 (Rate Limit)**:
```bash
# Esperar 15 minutos o
# Reiniciar servidor para reset
```

3. **Cache stale**:
```bash
# Limpiar cache del navegador
# O usar bustCache: true en requests
```

## 🛣️ Roadmap

- [ ] Tests automatizados completos
- [ ] Integración con Docker
- [ ] CI/CD pipeline
- [ ] Notificaciones push
- [ ] Analytics avanzado
- [ ] API GraphQL opcional
- [ ] Microservicios

## 👥 Contribución

1. Fork del repositorio
2. Crear branch para feature
3. Commit con mensaje descriptivo
4. Push al branch
5. Crear Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver archivo LICENSE para detalles.

## 📞 Soporte

Para soporte técnico:
- **Issues**: GitHub Issues
- **Email**: soporte@elijeser.com
- **Docs**: /docs (próximamente)

---

**Versión**: 2.0.0  
**Última actualización**: Diciembre 2024  
**Estado**: ✅ Producción Ready
