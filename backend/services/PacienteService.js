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
    // Validación más flexible que acepta guiones, espacios y paréntesis
    const telefonoRegex = /^[\+]?[\d\s\-\(\)]{7,20}$/;
    return telefonoRegex.test(telefono);
  }
  
  // Sanitizar datos del paciente
  static sanitizarDatosPaciente(data) {
    return {
      id_usuario: parseInt(data.id_usuario),
      nombre: data.nombre?.trim(),
      fecha_nacimiento: data.fecha_nacimiento,
      sexo: data.sexo?.trim(), // No convertir a mayúsculas para permitir "Otro"
      telefono: data.telefono?.trim(),
      ocupacion: data.ocupacion?.trim(),
      nivel_actividad: data.nivel_actividad?.trim(),
      objetivo: data.objetivo?.trim(),
      horas_sueno: Math.round(parseFloat(data.horas_sueno) || 0), // Convertir a entero
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
    
    if (!data.sexo || !['M', 'F', 'Otro'].includes(data.sexo)) {
      errores.push('Sexo debe ser M, F u Otro');
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
    try {
      const datosLimpios = this.sanitizarDatosPaciente(data);
      const errores = this.validarDatosPaciente(datosLimpios);
      
      if (errores.length > 0) {
        const error = new Error(`Errores de validación: ${errores.join(', ')}`);
        error.code = 'VALIDATION_ERROR';
        throw error;
      }
      
      let connection;
      try {
        connection = await pool.getConnection();
        
        const query = `
          INSERT INTO Pacientes (
            id_usuario, nombre, fecha_nacimiento, sexo, telefono, 
            ocupacion, nivel_actividad, objetivo, horas_sueno, 
            habitos, antecedentes
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
          id_paciente: result.insertId,
          ...datosLimpios
        };
        
      } catch (dbError) {
        console.error('Error en base de datos al crear paciente:', dbError);
        const error = new Error('Error interno del servidor');
        error.code = 'DATABASE_ERROR';
        throw error;
      } finally {
        if (connection) connection.release();
      }
      
    } catch (error) {
      // Re-lanzar errores ya procesados
      if (error.code) {
        throw error;
      }
      
      console.error('Error al crear paciente:', error);
      const dbError = new Error('Error interno del servidor');
      dbError.code = 'DATABASE_ERROR';
      throw dbError;
    }
  }
  
  // Obtener pacientes por usuario
  static async obtenerPacientesPorUsuario(idUsuario) {
    if (!idUsuario) {
      const error = new Error('ID de usuario es requerido');
      error.code = 'VALIDATION_ERROR';
      throw error;
    }
    
    let connection;
    try {
      connection = await pool.getConnection();
      
      const [pacientes] = await connection.query(`
        SELECT 
          id_paciente, id_usuario, nombre, fecha_nacimiento, sexo, 
          telefono, ocupacion, nivel_actividad, objetivo, horas_sueno, 
          habitos, antecedentes,
          TIMESTAMPDIFF(YEAR, fecha_nacimiento, CURDATE()) as edad
        FROM Pacientes 
        WHERE id_usuario = ? 
        ORDER BY id_paciente DESC
      `, [idUsuario]);
      
      return pacientes;
      
    } catch (error) {
      console.error('Error al obtener pacientes por usuario:', error);
      const dbError = new Error('Error interno del servidor');
      dbError.code = 'DATABASE_ERROR';
      throw dbError;
      
    } finally {
      if (connection) connection.release();
    }
  }
  
  // Obtener paciente por ID
  static async obtenerPacientePorId(idPaciente) {
    if (!idPaciente) {
      const error = new Error('ID de paciente es requerido');
      error.code = 'VALIDATION_ERROR';
      throw error;
    }

    let connection;
    try {
      connection = await pool.getConnection();
      
      const [pacientes] = await connection.query(`
        SELECT 
          id_paciente, id_usuario, nombre, fecha_nacimiento, sexo, 
          telefono, ocupacion, nivel_actividad, objetivo, horas_sueno, 
          habitos, antecedentes, activo,
          TIMESTAMPDIFF(YEAR, fecha_nacimiento, CURDATE()) as edad
        FROM Pacientes 
        WHERE id_paciente = ? 
        LIMIT 1
      `, [idPaciente]);
      
      if (pacientes.length === 0) {
        const error = new Error('Paciente no encontrado');
        error.code = 'NOT_FOUND';
        throw error;
      }
      
      return pacientes[0];
      
    } catch (error) {
      // Re-lanzar errores ya procesados
      if (error.code) {
        throw error;
      }
      
      console.error('Error al obtener paciente por ID:', error);
      const dbError = new Error('Error interno del servidor');
      dbError.code = 'DATABASE_ERROR';
      throw dbError;
      
    } finally {
      if (connection) connection.release();
    }
  }
  
  // Actualizar paciente
  static async actualizarPaciente(idPaciente, data) {
    const datosLimpios = this.sanitizarDatosPaciente(data);
    const errores = this.validarDatosPaciente(datosLimpios);
    
    if (errores.length > 0) {
      const error = new Error(`Errores de validación: ${errores.join(', ')}`);
      error.code = 'VALIDATION_ERROR';
      throw error;
    }

    let connection;
    try {
      connection = await pool.getConnection();
      
      // Query sin updated_at ya que la columna no existe
      const query = `
        UPDATE Pacientes SET
          nombre = ?, fecha_nacimiento = ?, sexo = ?, telefono = ?,
          ocupacion = ?, nivel_actividad = ?, objetivo = ?, horas_sueno = ?,
          habitos = ?, antecedentes = ?
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
        Math.round(datosLimpios.horas_sueno), // Convertir a entero para la BD
        datosLimpios.habitos,
        datosLimpios.antecedentes,
        idPaciente
      ]);
      
      if (result.affectedRows === 0) {
        const error = new Error('Paciente no encontrado');
        error.code = 'NOT_FOUND';
        throw error;
      }
      
      return await this.obtenerPacientePorId(idPaciente);
      
    } catch (error) {
      // Re-lanzar errores ya procesados
      if (error.code) {
        throw error;
      }
      
      console.error('Error al actualizar paciente:', error);
      const dbError = new Error('Error interno del servidor');
      dbError.code = 'DATABASE_ERROR';
      throw dbError;
      
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
