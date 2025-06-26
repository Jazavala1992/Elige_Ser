import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1]; // Obtén el token del encabezado

    if (!token) {
        return res.status(403).json({ message: "Token no proporcionado" });
    }

    try {
        // Usar el mismo secret que en UsuariosControllers.js
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret_key"); // Verifica el token
        req.userId = decoded.id; // El token contiene 'id'
        next(); // Continúa con la siguiente función
    } catch (error) {
        return res.status(401).json({ message: "Token inválido o expirado" });
    }
};