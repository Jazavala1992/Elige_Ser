import { Router } from "express";
import { registerUsuario, loginUsuario, getUsuario, deleteUsuario,updateUsuario } from "../controllers/UsuariosControllers.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/register", registerUsuario);
router.post("/login", loginUsuario);
router.get("/usuario/:id_usuario", verifyToken, getUsuario);
router.put("/usuario/:id_usuario", verifyToken, updateUsuario);
router.delete("/usuario/:id_usuario", verifyToken, deleteUsuario);
export default router;