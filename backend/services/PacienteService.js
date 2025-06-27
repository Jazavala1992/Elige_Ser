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
  
  // Validar datos del paciente para actualización (parcial)
  static validarDatosPacienteActualizacion(data) {
    const errores = [];
    
    // Solo validar campos que se están enviando
    if (data.id_usuario !== undefined && (!data.id_usuario || isNaN(data.id_usuario))) {
      errores.push('ID de usuario inválido');
    }
    
    if (data.nombre !== undefined && (!data.nombre || data.nombre.length < 2)) {
      errores.push('Nombre debe tener al menos 2 caracteres');
    }
    
    if (data.fecha_nacimiento !== undefined && (!data.fecha_nacimiento || !this.validarEdad(data.fecha_nacimiento))) {
      errores.push('Fecha de nacimiento inválida');
    }
    
    if (data.sexo !== undefined && (!data.sexo || !['M', 'F', 'Otro'].includes(data.sexo))) {
      errores.push('Sexo debe ser M, F u Otro');
    }
    
    if (data.telefono !== undefined && data.telefono && !this.validarTelefono(data.telefono)) {
      errores.push('Formato de teléfono inválido');
    }
    
    if (data.horas_sueno !== undefined && data.horas_sueno && (data.horas_sueno < 1 || data.horas_sueno > 24)) {
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
    if (!idPaciente) {
      const error = new Error('ID de paciente es requerido');
      error.code = 'VALIDATION_ERROR';
      throw error;
    }

    // Solo sanitizar y validar campos que se están enviando
    const datosLimpios = {};
    if (data.id_usuario !== undefined) datosLimpios.id_usuario = parseInt(data.id_usuario);
    if (data.nombre !== undefined) datosLimpios.nombre = data.nombre?.trim();
    if (data.fecha_nacimiento !== undefined) datosLimpios.fecha_nacimiento = data.fecha_nacimiento;
    if (data.sexo !== undefined) datosLimpios.sexo = data.sexo?.trim();
    if (data.telefono !== undefined) datosLimpios.telefono = data.telefono?.trim();
    if (data.ocupacion !== undefined) datosLimpios.ocupacion = data.ocupacion?.trim();
    if (data.nivel_actividad !== undefined) datosLimpios.nivel_actividad = data.nivel_actividad?.trim();
    if (data.objetivo !== undefined) datosLimpios.objetivo = data.objetivo?.trim();
    if (data.horas_sueno !== undefined) datosLimpios.horas_sueno = Math.round(parseFloat(data.horas_sueno) || 0);
    if (data.habitos !== undefined) datosLimpios.habitos = data.habitos?.trim();
    if (data.antecedentes !== undefined) datosLimpios.antecedentes = data.antecedentes?.trim();

    // Validar solo campos enviados
    const errores = this.validarDatosPacienteActualizacion(datosLimpios);
    
    if (errores.length > 0) {
      const error = new Error(`Errores de validación: ${errores.join(', ')}`);
      error.code = 'VALIDATION_ERROR';
      throw error;
    }

    // Si no hay campos para actualizar
    if (Object.keys(datosLimpios).length === 0) {
      const error = new Error('No hay campos para actualizar');
      error.code = 'VALIDATION_ERROR';
      throw error;
    }

    let connection;
    try {
      connection = await pool.getConnection();
      
      // Construir query dinámicamente
      const campos = [];
      const valores = [];
      
      if (datosLimpios.nombre !== undefined) {
        campos.push('nombre = ?');
        valores.push(datosLimpios.nombre);
      }
      if (datosLimpios.fecha_nacimiento !== undefined) {
        campos.push('fecha_nacimiento = ?');
        valores.push(datosLimpios.fecha_nacimiento);
      }
      if (datosLimpios.sexo !== undefined) {
        campos.push('sexo = ?');
        valores.push(datosLimpios.sexo);
      }
      if (datosLimpios.telefono !== undefined) {
        campos.push('telefono = ?');
        valores.push(datosLimpios.telefono);
      }
      if (datosLimpios.ocupacion !== undefined) {
        campos.push('ocupacion = ?');
        valores.push(datosLimpios.ocupacion);
      }
      if (datosLimpios.nivel_actividad !== undefined) {
        campos.push('nivel_actividad = ?');
        valores.push(datosLimpios.nivel_actividad);
      }
      if (datosLimpios.objetivo !== undefined) {
        campos.push('objetivo = ?');
        valores.push(datosLimpios.objetivo);
      }
      if (datosLimpios.horas_sueno !== undefined) {
        campos.push('horas_sueno = ?');
        valores.push(datosLimpios.horas_sueno);
      }
      if (datosLimpios.habitos !== undefined) {
        campos.push('habitos = ?');
        valores.push(datosLimpios.habitos);
      }
      if (datosLimpios.antecedentes !== undefined) {
        campos.push('antecedentes = ?');
        valores.push(datosLimpios.antecedentes);
      }
      
      valores.push(idPaciente);
      
      const query = `UPDATE Pacientes SET ${campos.join(', ')} WHERE id_paciente = ?`;
      const [result] = await connection.query(query, valores);
      
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
