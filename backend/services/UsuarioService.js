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
    // Al menos 8 caracteres, una mayúscula, una minúscula y un número
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
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
    
    // Validaciones de negocio
    if (!this.validarEmail(email)) {
      throw new Error('Formato de email inválido');
    }
    
    if (!this.validarPassword(password)) {
      throw new Error('La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número');
    }
    
    // Sanitizar datos
    const cleanData = {
      nombre: this.sanitizeInput(nombre),
      username: this.sanitizeInput(username),
      email: email.toLowerCase().trim(),
      password: await bcrypt.hash(password, 12) // Aumentado de 10 a 12 para más seguridad
    };
    
    return cleanData;
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
        throw new Error('Credenciales inválidas');
      }
      
      const user = users[0];
      const isValidPassword = await bcrypt.compare(password, user.password);
      
      if (!isValidPassword) {
        throw new Error('Credenciales inválidas');
      }
      
      // Retornar usuario sin contraseña
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
      
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
}
