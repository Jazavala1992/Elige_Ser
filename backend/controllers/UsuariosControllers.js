import {pool} from "../db.js";
import bccrypt from "bcrypt";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

export const registerUsuario = async (req, res) => {
  const { nombre, username, email, password } = req.body;

  try {
    // Verificar que todos los campos estén presentes
    if (!nombre || !username || !email || !password) {
      return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }

    // Encriptar la contraseña
    const salt = await bcrypt.genSalt(10); // Generar un salt
    const hashedPassword = await bcrypt.hash(password, salt); // Generar el hash de la contraseña

    // Guardar el usuario en la base de datos
    const query = "INSERT INTO Usuarios (nombre, username, email, password) VALUES (?, ?, ?, ?)";
    await pool.query(query, [nombre, username, email, hashedPassword]);

    res.status(201).json({ message: "Usuario creado exitosamente" });
  } catch (error) {
    console.error("Error al crear el usuario:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

export const loginUsuario = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validar que los campos estén presentes
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email y contraseña son requeridos" });
    }

    // Login temporal para testing mientras se configuran las variables de entorno
    // Esta credencial temporal permite probar la aplicación cuando la DB no está disponible
    if (email === "admin@admin.com" && password === "admin123") {
      console.log("⚠️ Usando autenticación temporal para:", email);
      return res.status(200).json({
        success: true,
        token: "temporary-admin-token",
        user: { id: 1, nombre: "Admin", username: "admin", email: "admin@admin.com" },
        message: "Login temporal - configurar variables de entorno DB"
      });
    }
    
    // También se puede agregar más cuentas temporales si es necesario
    if (email === "test@test.com" && password === "test123") {
      console.log("⚠️ Usando autenticación temporal para:", email);
      return res.status(200).json({
        success: true,
        token: "temporary-test-token",
        user: { id: 2, nombre: "Test User", username: "testuser", email: "test@test.com" },
        message: "Login temporal - configurar variables de entorno DB"
      });
    }

    // Buscar el usuario por email
    const [result] = await pool.query("SELECT * FROM Usuarios WHERE email = ?", [email]);

    if (result.length === 0) {
      return res.status(401).json({ success: false, message: "Credenciales inválidas" });
    }

    const user = result[0];

    // Verificar si la contraseña está encriptada
    const isEncrypted = user.password.startsWith("$2b$");
    let isMatch;

    if (isEncrypted) {
      // Comparar con contraseña encriptada
      isMatch = await bcrypt.compare(password, user.password);
    } else {
      // Comparar con contraseña en texto plano (para usuarios antiguos)
      isMatch = password === user.password;
    }

    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Credenciales inválidas" });
    }

    // Generar un token JWT
    const token = jwt.sign({ id: user.id_usuario }, "secret_key", { expiresIn: "1h" });

    return res.status(200).json({
      success: true,
      token,
      user: { id: user.id_usuario, nombre: user.nombre, username: user.username, email: user.email },
    });
  } catch (error) {
    console.error("Error en el servidor:", error);
    
    // Si es un error de conexión a DB y tenemos credenciales de admin, permitir login temporal
    if (error.code === 'PROTOCOL_CONNECTION_LOST' || error.code === 'ER_ACCESS_DENIED_ERROR') {
      const { email, password } = req.body;
      if (email === "admin@admin.com" && password === "admin123") {
        return res.status(200).json({
          success: true,
          token: "temporary-admin-token-db-error",
          user: { id: 1, nombre: "Admin", username: "admin", email: "admin@admin.com" },
          message: "Login temporal - error de base de datos"
        });
      }
    }
    
    return res.status(500).json({ success: false, message: "Error interno del servidor", error: error.message });
  }
};

export const getUsuario = async (req, res) => {
    try {
        const [result] = await pool.query('SELECT * FROM Usuarios WHERE id_usuario = ? AND activo = TRUE', [req.params.id_usuario]);
        if (result.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        res.json(result[0]);
    } catch (error) {
        console.error("Error en el servidor:", error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
};

export const updateUsuario = async (req, res) => {
    try {
        const result = await pool.query('UPDATE Usuarios SET ? WHERE id_usuario=?', [req.body, req.params.id_usuario]);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Usuario no encontrado' });
        res.json({ message: 'Usuario actualizado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export const deleteUsuario = async (req, res) => {
    try {
        const result = await pool.query('DELETE FROM Usuarios WHERE id_usuario = ?', [req.params.id_usuario]);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Usuario no encontrado' });
        res.json({ message: 'Usuario eliminado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

