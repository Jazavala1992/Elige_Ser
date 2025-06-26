import React, { useRef } from "react";
import { ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer } from "recharts";

export const GraficoResultadosCompuesto = ({ resultados, setGraficoRef }) => {
  const graficoRef = useRef(null);

  React.useEffect(() => {
    if (setGraficoRef) {
      setGraficoRef(graficoRef);
    }
  }, [setGraficoRef]);

  const datosGrafico = resultados.map((resultado, index) => ({
    name: `Resultado ${index + 1}`,
    "Indice de masa corporal (IMC)": resultado["Indice de masa corporal (IMC)"] || "N/A",
    "Porcentaje de grasa": resultado["Porcentaje de grasa"] || "N/A",
    "Masa muscular (kg)": resultado["Masa muscular (kg)"] || "N/A",
    "Masa residual": resultado["Masa residual"] || "N/A",
  }));

  return (
    <div ref={graficoRef} style={{ width: "100%", height: "400px" }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={datosGrafico} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="Indice de masa corporal (IMC)" fill="#8884d8" />
          <Bar dataKey="Porcentaje de grasa" fill="#82ca9d" />
          <Line type="monotone" dataKey="Masa muscular (kg)" stroke="#ff7300" />
          <Line type="monotone" dataKey="Masa residual" stroke="#387908" />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};