import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1]; // Obtén el token del encabezado

    if (!token) {
        return res.status(403).json({ message: "Token no proporcionado" });
    }

    try {
        const decoded = jwt.verify(token, "secret_key"); // Verifica el token
        req.userId = decoded.id_usuario; // Aquí no necesitas cambiar nada, ya que el token contiene `id_usuario` como `id`
        next(); // Continúa con la siguiente función
    } catch (error) {
        return res.status(401).json({ message: "Token inválido o expirado" });
    }
};