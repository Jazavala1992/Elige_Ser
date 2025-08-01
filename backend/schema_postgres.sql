-- Esquema PostgreSQL equivalente al MySQL original
-- Ejecutar después de crear la base de datos en Render

-- Tabla usuarios
CREATE TABLE usuarios (
    id_usuario SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido_paterno VARCHAR(100) NOT NULL,
    apellido_materno VARCHAR(100),
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla pacientes
CREATE TABLE pacientes (
    id_paciente SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido_paterno VARCHAR(100) NOT NULL,
    apellido_materno VARCHAR(100),
    fecha_nacimiento DATE NOT NULL,
    sexo CHAR(1) CHECK (sexo IN ('M', 'F')) NOT NULL,
    telefono VARCHAR(15),
    email VARCHAR(150),
    direccion TEXT,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla consultas
CREATE TABLE consultas (
    id_consulta SERIAL PRIMARY KEY,
    id_paciente INTEGER NOT NULL REFERENCES pacientes(id_paciente) ON DELETE CASCADE,
    fecha_consulta DATE NOT NULL,
    hora TIME,
    observaciones TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla mediciones
CREATE TABLE mediciones (
    id_medicion SERIAL PRIMARY KEY,
    id_consulta INTEGER NOT NULL REFERENCES consultas(id_consulta) ON DELETE CASCADE,
    peso DECIMAL(5,2),
    talla DECIMAL(5,2),
    pl_tricipital DECIMAL(4,1),
    pl_bicipital DECIMAL(4,1),
    pl_subescapular DECIMAL(4,1),
    pl_supraespinal DECIMAL(4,1),
    pl_suprailiaco DECIMAL(4,1),
    pl_abdominal DECIMAL(4,1),
    pl_muslo_medial DECIMAL(4,1),
    pl_pantorrilla_medial DECIMAL(4,1),
    per_brazo_reposo DECIMAL(4,1),
    per_brazo_flex DECIMAL(4,1),
    per_muslo_medio DECIMAL(4,1),
    per_pantorrilla_medial DECIMAL(4,1),
    per_cintura DECIMAL(4,1),
    per_cadera DECIMAL(4,1),
    diametro_humeral DECIMAL(4,1),
    diametro_biestiloideo DECIMAL(4,1),
    diametro_femoral DECIMAL(4,1),
    fecha_medicion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla resultados
CREATE TABLE resultados (
    id_resultado SERIAL PRIMARY KEY,
    id_medicion INTEGER NOT NULL REFERENCES mediciones(id_medicion) ON DELETE CASCADE,
    imc DECIMAL(5,2),
    suma_pliegues DECIMAL(6,2),
    porcentaje_grasa DECIMAL(5,2),
    masa_muscular_kg DECIMAL(5,2),
    porcentaje_masa_muscular DECIMAL(5,2),
    masa_osea DECIMAL(5,2),
    masa_residual DECIMAL(5,2),
    fecha_calculo TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para mejorar rendimiento
CREATE INDEX idx_consultas_paciente ON consultas(id_paciente);
CREATE INDEX idx_mediciones_consulta ON mediciones(id_consulta);
CREATE INDEX idx_resultados_medicion ON resultados(id_medicion);
CREATE INDEX idx_pacientes_email ON pacientes(email);
CREATE INDEX idx_usuarios_email ON usuarios(email);

-- Insertar usuario admin por defecto
INSERT INTO usuarios (nombre, apellido_paterno, apellido_materno, email, password) 
VALUES ('Admin', 'System', 'User', 'admin@admin.com', 'admin123')
ON CONFLICT (email) DO NOTHING;
