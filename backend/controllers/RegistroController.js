import { queryAdapter } from "../db_adapter.js";

export const registrarLog = async (req, res) => {
  const { id_usuario, ip, evento, navegador, fecha_hora } = req.body;

  console.log("Datos recibidos:", req.body);

  if (!id_usuario || !ip || !evento || !navegador || !fecha_hora) {
    return res.status(400).json({ error: "Faltan datos en el registro" });
  }

  try {
    const result = await queryAdapter(
      "INSERT INTO logs_acceso (id_usuario, ip, evento, navegador, fecha_hora) VALUES ($1, $2, $3, $4, $5)",
      [id_usuario, ip, evento, navegador, fecha_hora]
    );
    res.status(201).json({ message: "Registro guardado exitosamente" });
  } catch (err) {
    console.error("Error al insertar el registro:", err);
    return res.status(500).json({ error: "Error al guardar el registro" });
  }
};
