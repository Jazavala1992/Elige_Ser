import { queryAdapter } from "../db_adapter.js";
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
    const salt = await bcrypt.genSalt(10); // Generar un salt
    const hashedPassword = await bcrypt.hash(password, salt); // Generar el hash de la contraseña

    // Guardar el usuario en la base de datos
    const query = "INSERT INTO usuarios (nombre, apellido_paterno, email, password) VALUES ($1, $2, $3, $4)";
    await queryAdapter(query, [nombre, username, email, hashedPassword]);

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
        user: { id: 1, nombre: "Admin", apellido_paterno: "System", email: "admin@admin.com" },
        message: "Login temporal - configurar variables de entorno DB"
      });
    }
    
    // También se puede agregar más cuentas temporales si es necesario
    if (email === "test@test.com" && password === "test123") {
      console.log("⚠️ Usando autenticación temporal para:", email);
      return res.status(200).json({
        success: true,
        token: "temporary-test-token",
        user: { id: 2, nombre: "Test User", apellido_paterno: "Testing", email: "test@test.com" },
        message: "Login temporal - configurar variables de entorno DB"
      });
    }

    // Buscar el usuario por email
    const result = await queryAdapter("SELECT * FROM usuarios WHERE email = $1", [email]);

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

    // Generar un token JWT usando la misma clave que el middleware
    const token = jwt.sign({ id: user.id_usuario }, process.env.JWT_SECRET || "secret_key", { expiresIn: "1h" });

    return res.status(200).json({
      success: true,
      token,
      user: { id: user.id_usuario, nombre: user.nombre, apellido_paterno: user.apellido_paterno, email: user.email },
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
        const result = await queryAdapter('SELECT * FROM usuarios WHERE id_usuario = $1', [req.params.id]);
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
        console.log("🔄 Actualizando usuario ID:", req.params.id);
        console.log("📝 Datos recibidos:", req.body);
        
        const result = await queryAdapter(
            'UPDATE usuarios SET nombre = $1, apellido_paterno = $2, apellido_materno = $3, email = $4, telefono = $5 WHERE id_usuario = $6', 
            [req.body.nombre, req.body.apellido_paterno, req.body.apellido_materno, req.body.email, req.body.telefono, req.params.id]
        );
        
        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        }
        
        res.json({ success: true, message: 'Usuario actualizado correctamente' });
    } catch (error) {
        console.error("Error al actualizar usuario:", error);
        res.status(500).json({ success: false, error: error.message });
    }
}

export const deleteUsuario = async (req, res) => {
    try {
        const result = await queryAdapter('DELETE FROM usuarios WHERE id_usuario = $1', [req.params.id_usuario]);
        if (result.rowCount === 0) return res.status(404).json({ message: 'Usuario no encontrado' });
        res.json({ message: 'Usuario eliminado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

