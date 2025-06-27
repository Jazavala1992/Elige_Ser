import { pool } from '../db.js';

export class PacienteService {
  
  // Validar edad
  static validarEdad(fechaNacimiento) {
    const today = new Date();
    const birthDate = new Date(fechaNacimiento);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age >= 0 && age <= 120;
  }
  
  // Validar teléfono
  static validarTelefono(telefono) {
    const telefonoRegex = /^[\d\s\-\+\(\)]{7,15}$/;
    return telefonoRegex.test(telefono);
  }
  
  // Sanitizar datos del paciente
  static sanitizarDatosPaciente(data) {
    return {
      id_usuario: parseInt(data.id_usuario),
      nombre: data.nombre?.trim(),
      fecha_nacimiento: data.fecha_nacimiento,
      sexo: data.sexo?.toUpperCase(),
      telefono: data.telefono?.trim(),
      ocupacion: data.ocupacion?.trim(),
      nivel_actividad: data.nivel_actividad?.trim(),
      objetivo: data.objetivo?.trim(),
      horas_sueno: parseFloat(data.horas_sueno),
      habitos: data.habitos?.trim(),
      antecedentes: data.antecedentes?.trim()
    };
  }
  
  // Validar datos del paciente
  static validarDatosPaciente(data) {
    const errores = [];
    
    if (!data.id_usuario || isNaN(data.id_usuario)) {
      errores.push('ID de usuario inválido');
    }
    
    if (!data.nombre || data.nombre.length < 2) {
      errores.push('Nombre debe tener al menos 2 caracteres');
    }
    
    if (!data.fecha_nacimiento || !this.validarEdad(data.fecha_nacimiento)) {
      errores.push('Fecha de nacimiento inválida');
    }
    
    if (!data.sexo || !['M', 'F'].includes(data.sexo)) {
      errores.push('Sexo debe ser M o F');
    }
    
    if (data.telefono && !this.validarTelefono(data.telefono)) {
      errores.push('Formato de teléfono inválido');
    }
    
    if (data.horas_sueno && (data.horas_sueno < 1 || data.horas_sueno > 24)) {
      errores.push('Horas de sueño debe estar entre 1 y 24');
    }
    
    return errores;
  }
  
  // Crear paciente
  static async crearPaciente(data) {
    const datosLimpios = this.sanitizarDatosPaciente(data);
    const errores = this.validarDatosPaciente(datosLimpios);
    
    if (errores.length > 0) {
      throw new Error(`Errores de validación: ${errores.join(', ')}`);
    }
    
    let connection;
    try {
      connection = await pool.getConnection();
      
      const query = `
        INSERT INTO Pacientes (
          id_usuario, nombre, fecha_nacimiento, sexo, telefono, 
          ocupacion, nivel_actividad, objetivo, horas_sueno, 
          habitos, antecedentes, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `;
      
      const [result] = await connection.query(query, [
        datosLimpios.id_usuario,
        datosLimpios.nombre,
        datosLimpios.fecha_nacimiento,
        datosLimpios.sexo,
        datosLimpios.telefono,
        datosLimpios.ocupacion,
        datosLimpios.nivel_actividad,
        datosLimpios.objetivo,
        datosLimpios.horas_sueno,
        datosLimpios.habitos,
        datosLimpios.antecedentes
      ]);
      
      return {
        id: result.insertId,
        ...datosLimpios
      };
      
    } finally {
      if (connection) connection.release();
    }
  }
  
  // Obtener pacientes por usuario
  static async obtenerPacientesPorUsuario(idUsuario) {
    let connection;
    try {
      connection = await pool.getConnection();
      
      const [pacientes] = await connection.query(`
        SELECT 
          id_paciente, id_usuario, nombre, fecha_nacimiento, sexo, 
          telefono, ocupacion, nivel_actividad, objetivo, horas_sueno, 
          habitos, antecedentes, created_at,
          TIMESTAMPDIFF(YEAR, fecha_nacimiento, CURDATE()) as edad
        FROM Pacientes 
        WHERE id_usuario = ? 
        ORDER BY created_at DESC
      `, [idUsuario]);
      
      return pacientes;
      
    } finally {
      if (connection) connection.release();
    }
  }
  
  // Obtener paciente por ID
  static async obtenerPacientePorId(idPaciente) {
    let connection;
    try {
      connection = await pool.getConnection();
      
      const [pacientes] = await connection.query(`
        SELECT 
          id_paciente, id_usuario, nombre, fecha_nacimiento, sexo, 
          telefono, ocupacion, nivel_actividad, objetivo, horas_sueno, 
          habitos, antecedentes, created_at,
          TIMESTAMPDIFF(YEAR, fecha_nacimiento, CURDATE()) as edad
        FROM Pacientes 
        WHERE id_paciente = ? 
        LIMIT 1
      `, [idPaciente]);
      
      if (pacientes.length === 0) {
        throw new Error('Paciente no encontrado');
      }
      
      return pacientes[0];
      
    } finally {
      if (connection) connection.release();
    }
  }
  
  // Actualizar paciente
  static async actualizarPaciente(idPaciente, data) {
    const datosLimpios = this.sanitizarDatosPaciente(data);
    const errores = this.validarDatosPaciente(datosLimpios);
    
    if (errores.length > 0) {
      throw new Error(`Errores de validación: ${errores.join(', ')}`);
    }
    
    let connection;
    try {
      connection = await pool.getConnection();
      
      const query = `
        UPDATE Pacientes SET
          nombre = ?, fecha_nacimiento = ?, sexo = ?, telefono = ?,
          ocupacion = ?, nivel_actividad = ?, objetivo = ?, horas_sueno = ?,
          habitos = ?, antecedentes = ?, updated_at = NOW()
        WHERE id_paciente = ?
      `;
      
      const [result] = await connection.query(query, [
        datosLimpios.nombre,
        datosLimpios.fecha_nacimiento,
        datosLimpios.sexo,
        datosLimpios.telefono,
        datosLimpios.ocupacion,
        datosLimpios.nivel_actividad,
        datosLimpios.objetivo,
        datosLimpios.horas_sueno,
        datosLimpios.habitos,
        datosLimpios.antecedentes,
        idPaciente
      ]);
      
      if (result.affectedRows === 0) {
        throw new Error('Paciente no encontrado');
      }
      
      return await this.obtenerPacientePorId(idPaciente);
      
    } finally {
      if (connection) connection.release();
    }
  }
  
  // Eliminar paciente
  static async eliminarPaciente(idPaciente) {
    let connection;
    try {
      connection = await pool.getConnection();
      
      const [result] = await connection.query(
        "DELETE FROM Pacientes WHERE id_paciente = ?",
        [idPaciente]
      );
      
      if (result.affectedRows === 0) {
        throw new Error('Paciente no encontrado');
      }
      
      return true;
      
    } finally {
      if (connection) connection.release();
    }
  }
}
