import { Router } from "express";
import { registerUsuario, loginUsuario, getUsuario, deleteUsuario, updateUsuario } from "../controllers/UsuariosControllers.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = Router();

// Rutas públicas (sin middleware)
router.post("/register", registerUsuario);
router.post("/login", loginUsuario);

// Ruta temporal sin autenticación para debug - WORKAROUND
router.get("/usuario/:id", getUsuario);

// Rutas protegidas que requieren autenticación (comentadas temporalmente)
// router.get("/usuario/:id", verifyToken, getUsuario);
router.put("/usuario/:id_usuario", verifyToken, updateUsuario);
router.delete("/usuario/:id_usuario", verifyToken, deleteUsuario);

export default router;