import { UsuarioService } from "../services/UsuarioService.js";
import jwt from "jsonwebtoken";

export const registerUsuario = async (req, res) => {
  try {
    const { nombre, username, email, password } = req.body;

    const result = await UsuarioService.crearUsuario({
      nombre,
      username,
      email,
      password
    });

    res.status(201).json(result);
  } catch (error) {
    console.error("Error al crear el usuario:", error);
    
    if (error.code === 'VALIDATION_ERROR') {
      return res.status(400).json({ error: error.message });
    }
    if (error.code === 'DUPLICATE_ENTRY') {
      return res.status(400).json({ error: error.message });
    }
    if (error.code === 'DATABASE_ERROR') {
      return res.status(500).json({ error: "Error interno del servidor" });
    }
    
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

export const loginUsuario = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await UsuarioService.autenticarUsuario(email, password);

    // Usar variable de entorno para JWT secret
    const token = jwt.sign(
      { id: result.user.id }, 
      process.env.JWT_SECRET || "secret_key", 
      { expiresIn: "1h" }
    );

    return res.status(200).json({
      success: true,
      token,
      user: result.user
    });
  } catch (error) {
    console.error("Error en el servidor:", error);
    
    if (error.code === 'VALIDATION_ERROR' || error.code === 'AUTH_ERROR') {
      return res.status(401).json({ success: false, message: error.message });
    }
    
    return res.status(500).json({ success: false, message: "Error interno del servidor" });
  }
};

export const getUsuario = async (req, res) => {
    try {
        const result = await UsuarioService.obtenerUsuarioPorId(req.params.id);
        
        res.json({
            success: true,
            user: result
        });
    } catch (error) {
        console.error("Error en el servidor:", error);
        
        if (error.code === 'NOT_FOUND') {
            return res.status(404).json({ 
                success: false, 
                message: error.message 
            });
        }
        
        res.status(500).json({ 
            success: false, 
            message: 'Error interno del servidor'
        });
    }
};

export const updateUsuario = async (req, res) => {
    try {
        const result = await UsuarioService.actualizarUsuario(req.params.id_usuario, req.body);
        res.json(result);
    } catch (error) {
        console.error("Error al actualizar usuario:", error);
        
        if (error.code === 'NOT_FOUND') {
            return res.status(404).json({ message: error.message });
        }
        if (error.code === 'VALIDATION_ERROR') {
            return res.status(400).json({ error: error.message });
        }
        
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}

export const deleteUsuario = async (req, res) => {
    try {
        const result = await UsuarioService.eliminarUsuario(req.params.id_usuario);
        res.json(result);
    } catch (error) {
        console.error("Error al eliminar usuario:", error);
        
        if (error.code === 'NOT_FOUND') {
            return res.status(404).json({ message: error.message });
        }
        
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}

export const getPacientesPorUsuario = async (req, res) => {
    try {
        const result = await UsuarioService.obtenerPacientesPorUsuario(req.params.id_usuario);
        
        res.json({
            success: true,
            pacientes: result
        });
    } catch (error) {
        console.error("Error en el servidor:", error);
        
        if (error.code === 'NOT_FOUND') {
            return res.status(404).json({ 
                success: false, 
                message: error.message 
            });
        }
        
        res.status(500).json({ 
            success: false, 
            message: 'Error interno del servidor'
        });
    }
};

