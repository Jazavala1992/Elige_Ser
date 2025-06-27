import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../db.js';

export class UsuarioService {
  
  // Validar email
  static validarEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  // Validar contraseña
  static validarPassword(password) {
    // Al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  }
  
  // Sanitizar entrada
  static sanitizeInput(input) {
    if (typeof input === 'string') {
      return input.trim().replace(/[<>]/g, '');
    }
    return input;
  }
  
  // Crear usuario
  static async crearUsuario(userData) {
    const { nombre, username, email, password } = userData;
    
    // Validaciones básicas
    if (!nombre || !username || !email || !password) {
      const error = new Error('Todos los campos son requeridos');
      error.code = 'VALIDATION_ERROR';
      throw error;
    }
    
    // Validaciones de negocio
    if (!this.validarEmail(email)) {
      const error = new Error('Formato de email inválido');
      error.code = 'VALIDATION_ERROR';
      throw error;
    }
    
    if (!this.validarPassword(password)) {
      const error = new Error('La contraseña debe contener al menos: 1 minúscula, 1 mayúscula, 1 número y 1 carácter especial');
      error.code = 'VALIDATION_ERROR';
      throw error;
    }
    
    let connection;
    try {
      connection = await pool.getConnection();
      
      // Verificar si el email ya existe
      const [existingEmail] = await connection.query(
        "SELECT COUNT(*) as count FROM Usuarios WHERE email = ?",
        [email.toLowerCase().trim()]
      );
      
      if (existingEmail[0].count > 0) {
        const error = new Error('El email ya está registrado');
        error.code = 'DUPLICATE_ENTRY';
        throw error;
      }
      
      // Verificar si el username ya existe
      const [existingUsername] = await connection.query(
        "SELECT COUNT(*) as count FROM Usuarios WHERE username = ?",
        [username.toLowerCase().trim()]
      );
      
      if (existingUsername[0].count > 0) {
        const error = new Error('El username ya está registrado');
        error.code = 'DUPLICATE_ENTRY';
        throw error;
      }
      
      // Sanitizar datos
      const cleanData = {
        nombre: this.sanitizeInput(nombre),
        username: this.sanitizeInput(username),
        email: email.toLowerCase().trim(),
        password: await bcrypt.hash(password, 12)
      };
      
      // Insertar usuario
      const [result] = await connection.query(
        "INSERT INTO Usuarios (nombre, username, email, password) VALUES (?, ?, ?, ?)",
        [cleanData.nombre, cleanData.username, cleanData.email, cleanData.password]
      );
      
      return {
        success: true,
        message: 'Usuario creado exitosamente',
        user: {
          id: result.insertId,
          nombre: cleanData.nombre,
          username: cleanData.username,
          email: cleanData.email
        }
      };
      
    } catch (error) {
      // Re-lanzar errores ya procesados
      if (error.code) {
        throw error;
      }
      
      // Manejar errores de MySQL
      if (error.errno === 1062) { // Duplicate entry
        const duplicateError = new Error('El email o username ya existe');
        duplicateError.code = 'DUPLICATE_ENTRY';
        throw duplicateError;
      }
      
      console.error('Error en base de datos:', error);
      const dbError = new Error('Error interno del servidor');
      dbError.code = 'DATABASE_ERROR';
      throw dbError;
      
    } finally {
      if (connection) connection.release();
    }
  }
  
  // Verificar credenciales
  static async verificarCredenciales(email, password) {
    let connection;
    try {
      connection = await pool.getConnection();
      const [users] = await connection.query(
        "SELECT id_usuario, nombre, username, email, password FROM Usuarios WHERE email = ? LIMIT 1",
        [email.toLowerCase().trim()]
      );
      
      if (users.length === 0) {
        const error = new Error('Credenciales inválidas');
        error.code = 'AUTH_ERROR';
        throw error;
      }
      
      const user = users[0];
      const isValidPassword = await bcrypt.compare(password, user.password);
      
      if (!isValidPassword) {
        const error = new Error('Credenciales inválidas');
        error.code = 'AUTH_ERROR';
        throw error;
      }
      
      // Retornar usuario sin contraseña
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
      
    } catch (error) {
      // Re-lanzar errores ya procesados
      if (error.code) {
        throw error;
      }
      
      console.error('Error en verificación de credenciales:', error);
      const authError = new Error('Error en autenticación');
      authError.code = 'AUTH_ERROR';
      throw authError;
      
    } finally {
      if (connection) connection.release();
    }
  }
  
  // Generar JWT
  static generarToken(userData) {
    return jwt.sign(
      { 
        id: userData.id_usuario, 
        email: userData.email,
        username: userData.username
      },
      process.env.JWT_SECRET || 'secret_key',
      { expiresIn: '24h' }
    );
  }
  
  // Verificar JWT
  static verificarToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
    } catch (error) {
      throw new Error('Token inválido');
    }
  }
  
  // Obtener usuario por ID
  static async obtenerUsuarioPorId(id) {
    let connection;
    try {
      connection = await pool.getConnection();
      const [users] = await connection.query(
        "SELECT id_usuario, nombre, username, email, created_at FROM Usuarios WHERE id_usuario = ? LIMIT 1",
        [id]
      );
      
      if (users.length === 0) {
        throw new Error('Usuario no encontrado');
      }
      
      return users[0];
      
    } finally {
      if (connection) connection.release();
    }
  }
  
  // Verificar si email existe
  static async emailExiste(email) {
    let connection;
    try {
      connection = await pool.getConnection();
      const [result] = await connection.query(
        "SELECT COUNT(*) as count FROM Usuarios WHERE email = ?",
        [email.toLowerCase().trim()]
      );
      
      return result[0].count > 0;
      
    } finally {
      if (connection) connection.release();
    }
  }
  
  // Verificar si username existe
  static async usernameExiste(username) {
    let connection;
    try {
      connection = await pool.getConnection();
      const [result] = await connection.query(
        "SELECT COUNT(*) as count FROM Usuarios WHERE username = ?",
        [username.toLowerCase().trim()]
      );
      
      return result[0].count > 0;
      
    } finally {
      if (connection) connection.release();
    }
  }
  
  // Autenticar usuario (login)
  static async autenticarUsuario(email, password) {
    if (!email || !password) {
      const error = new Error('Email y contraseña son requeridos');
      error.code = 'VALIDATION_ERROR';
      throw error;
    }
    
    try {
      const user = await this.verificarCredenciales(email, password);
      
      return {
        success: true,
        message: 'Autenticación exitosa',
        user: {
          id: user.id_usuario,
          nombre: user.nombre,
          username: user.username,
          email: user.email
        }
      };
    } catch (error) {
      console.error('Error en autenticación:', error);
      const authError = new Error('Credenciales inválidas');
      authError.code = 'AUTH_ERROR';
      throw authError;
    }
  }
}
