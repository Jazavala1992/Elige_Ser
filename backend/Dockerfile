# Dockerfile para el backend
FROM node:18-alpine

# Crear directorio de la aplicación
WORKDIR /usr/src/app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci --only=production

# Copiar código fuente
COPY . .

# Crear directorios necesarios
RUN mkdir -p logs temp uploads

# Exponer puerto
EXPOSE 3000

# Configurar usuario no-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S backend -u 1001
RUN chown -R backend:nodejs /usr/src/app
USER backend

# Comando de inicio
CMD ["node", "index.js"]
