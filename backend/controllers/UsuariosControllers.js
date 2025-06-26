import {pool} from "../db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const registerUsuario = async (req, res) => {
  const { nombre, username, email, password } = req.body;

  try {
    // Verificar que todos los campos estén presentes
    if (!nombre || !username || !email || !password) {
      return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }

    // Encriptar la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Usar el mismo nombre de tabla que en otras funciones (Usuarios con mayúscula)
    const query = "INSERT INTO Usuarios (nombre, username, email, password) VALUES (?, ?, ?, ?)";
    const [result] = await pool.query(query, [nombre, username, email, hashedPassword]);

    res.status(201).json({ message: "Usuario creado exitosamente", id: result.insertId });
  } catch (error) {
    console.error("Error al crear el usuario:", error);
    
    // Más información específica del error
    if (error.code === 'ER_NO_SUCH_TABLE') {
      return res.status(500).json({ error: "La tabla Usuarios no existe" });
    }
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: "El email o username ya existe" });
    }
    
    res.status(500).json({ error: "Error interno del servidor", details: error.message });
  }
};

export const loginUsuario = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email y contraseña son requeridos" });
    }

    const [result] = await pool.query("SELECT * FROM Usuarios WHERE email = ?", [email]);

    if (result.length === 0) {
      return res.status(401).json({ success: false, message: "Credenciales inválidas" });
    }

    const user = result[0];

    // Verificar contraseña
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Credenciales inválidas" });
    }

    // Usar variable de entorno para JWT secret
    const token = jwt.sign(
      { id: user.id_usuario }, 
      process.env.JWT_SECRET || "secret_key", 
      { expiresIn: "1h" }
    );

    return res.status(200).json({
      success: true,
      token,
      user: { id: user.id_usuario, nombre: user.nombre, username: user.username, email: user.email },
    });
  } catch (error) {
    console.error("Error en el servidor:", error);
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

