import { pool } from "../db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const registerUsuario = async (req, res) => {
    try {
        const { username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await pool.query('INSERT INTO Usuarios (username, password) VALUES (?, ?)', [username, hashedPassword]);
        res.json({ message: "Usuario registrado", id: result.insertId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const loginUsuario = async (req, res) => {
    try {
        const { username, password } = req.body;
        const [result] = await pool.query('SELECT * FROM Usuarios WHERE username = ?', [username]);
        if (result.length === 0) return res.status(404).json({ message: "Usuario no encontrado" });

        const isPasswordValid = await bcrypt.compare(password, result[0].password);
        if (!isPasswordValid) return res.status(401).json({ message: "Credenciales inválidas" });

        const token = jwt.sign({ id: result[0].id }, "secret_key", { expiresIn: "1h" });
        const refreshToken = jwt.sign({ id: result[0].id }, "secret_key_refresh", { expiresIn: "7d" });

        res.json({ token, refreshToken });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};