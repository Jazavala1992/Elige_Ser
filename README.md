# Sistema ElijeSer

Sistema web completo para el manejo de pacientes en consultoría nutricional desarrollado con React (Frontend) y Node.js/Express (Backend).

## 🚀 Características Principales

- **Autenticación segura** con JWT y encriptación de contraseñas con bcrypt
- **Gestión completa de pacientes** con validaciones robustas
- **Generación de reportes PDF** con gráficos y datos médicos
- **Formularios reactivos** con validación en tiempo real
- **Eliminación lógica** de registros para mantener historial
- **Validación de teléfonos** solo numéricos
- **Interfaz responsiva** con Bootstrap/Reactstrap

## 🛠️ Tecnologías Utilizadas

### Frontend
- **React 19** - Framework de interfaz de usuario
- **Vite** - Herramienta de construcción y desarrollo
- **Formik + Yup** - Manejo y validación de formularios
- **SweetAlert2** - Alertas y notificaciones
- **jsPDF + html2canvas** - Generación de PDFs
- **Recharts** - Gráficos y visualización de datos
- **Reactstrap** - Componentes de Bootstrap para React
- **React Router** - Navegación
- **Axios** - Cliente HTTP

### Backend
- **Node.js** - Entorno de ejecución
- **Express** - Framework web
- **MySQL2** - Base de datos y conexión
- **bcrypt** - Encriptación de contraseñas
- **jsonwebtoken** - Autenticación JWT
- **cors** - Manejo de CORS
- **nodemon** - Desarrollo y recarga automática

## 📁 Estructura del Proyecto

```
ElijeSer/
├── backend/
│   ├── controllers/         # Controladores de la API
│   ├── middlewares/        # Middlewares de autenticación
│   ├── routes/             # Rutas de la API
│   ├── config.js           # Configuración general
│   ├── db.js              # Configuración de base de datos
│   └── index.js           # Punto de entrada del servidor
├── frontend/
│   ├── src/
│   │   ├── componentes/    # Componentes React
│   │   ├── context/        # Context API para estado global
│   │   ├── paginas/        # Páginas principales
│   │   ├── rutas/          # Configuración de rutas
│   │   ├── css/            # Estilos CSS
│   │   └── api/            # Configuración de API
│   └── public/             # Archivos estáticos
└── README.md
```

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js (v18 o superior)
- MySQL/MariaDB
- npm o yarn

### Backend

1. Navega al directorio del backend:
```bash
cd backend
```

2. Instala las dependencias:
```bash
npm install
```

3. Configura la base de datos en `db.js`:
```javascript
export const pool = createPool({
    host: 'localhost',
    user: 'tu_usuario',
    password: 'tu_contraseña',
    database: 'ElijeSer',
});
```

4. Inicia el servidor:
```bash
npm start
```

El backend estará corriendo en `http://localhost:4000`

### Frontend

1. Navega al directorio del frontend:
```bash
cd frontend
```

2. Instala las dependencias:
```bash
npm install
```

3. Inicia el servidor de desarrollo:
```bash
npm run dev
```

El frontend estará disponible en `http://localhost:5173`

## 📊 Funcionalidades Implementadas

### ✅ Autenticación
- Login con validación de contraseñas encriptadas
- Compatibilidad con contraseñas legacy
- Tokens JWT para sesiones seguras
- Middleware de autenticación

### ✅ Gestión de Pacientes
- Registro de pacientes con validación completa
- Validación de teléfonos solo numéricos
- Actualización de información
- Eliminación lógica (soft delete)

### ✅ Reportes y PDFs
- Generación de PDFs con datos del paciente
- Inclusión de gráficos de Recharts en PDFs
- Exportación de mediciones y resultados

### ✅ Validaciones
- Formularios con Formik y Yup
- Validación en tiempo real
- Mensajes de error personalizados
- Restricciones de entrada (solo números en teléfonos)

## 🔧 Configuración de Base de Datos

### Estructura de Tablas Principales

```sql
-- Tabla de usuarios
CREATE TABLE Usuarios (
    id_usuario INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    contraseña VARCHAR(255) NOT NULL,
    activo BOOLEAN DEFAULT TRUE
);

-- Tabla de pacientes
CREATE TABLE Pacientes (
    id_paciente INT PRIMARY KEY AUTO_INCREMENT,
    id_usuario INT,
    nombre VARCHAR(100) NOT NULL,
    fecha_nacimiento DATE,
    sexo CHAR(1),
    telefono VARCHAR(15),
    ocupacion VARCHAR(100),
    nivel_actividad VARCHAR(50),
    objetivo TEXT,
    horas_sueno INT,
    habitos TEXT,
    antecedentes TEXT,
    activo BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario)
);
```

## 🔐 Seguridad

- **Contraseñas encriptadas** con bcrypt
- **Autenticación JWT** para API endpoints
- **Validación de datos** en frontend y backend
- **Eliminación lógica** para preservar integridad de datos
- **Middleware de autenticación** para rutas protegidas

## 🎨 Características de UI/UX

- **Diseño responsivo** compatible con móviles y desktop
- **Alertas interactivas** con SweetAlert2
- **Formularios intuitivos** con validación visual
- **Navegación fluida** con React Router
- **Componentes reutilizables** con Reactstrap

## 📈 Próximas Mejoras

- [ ] Dashboard con estadísticas
- [ ] Calendario de citas
- [ ] Notificaciones push
- [ ] Historial de cambios
- [ ] Backup automático de datos
- [ ] API versioning
- [ ] Tests unitarios y de integración

## 🤝 Contribución

Las contribuciones son bienvenidas. Por favor:

1. Haz fork del proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👨‍💻 Autor

**José Zavala** - Desarrollo Full Stack

---

⭐ Si este proyecto te fue útil, no olvides darle una estrella en GitHub!
// Force deploy
