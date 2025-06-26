import React, { useState, useEffect, use } from "react";
import { Table, Form, FormGroup, Label, Input, Button } from "reactstrap";
import "../css/mediciones.css";
import { useResultados } from "../context/ResultadosContext";
import { useMediciones } from "../context/MedicionesContext";
import Swal from 'sweetalert2';
import {  ResponsiveContainer } from "recharts";
import { GraficoResultadosCompuesto } from "./GraficoResultadosCompuesto";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function Mediciones({ idConsulta, idPaciente }) {
  const { crearMediciones, medicion, obtenerMedicionesPorPaciente } = useMediciones();
  const { crearResultados, resultadoContext, obetenerresultadosPorPaciente  } = useResultados();
  
  

  const [datos, setDatos] = useState({
    Peso: "",
    Talla: "",
    "Perímetro brazo relajado": "",
    "Perímetro brazo tensión": "",
    "Perímetro muslo": "",
    "Perímetro pantorrilla": "",
    "Perímetro cintura": "",
    "Perímetro cadera": "",
    "Pliegue subescapular": "",
    "Pliegue tricipital": "",
    "Pliegue bicipital": "",
    "Pliegue supraespinal": "",
    "Pliegue ileocrestal": "",
    "Pliegue abdominal": "",
    "Pliegue muslo": "",
    "Pliegue pantorrilla": "",
    "Diametro humeral": "",
    "Diametro biestiloideo": "",
    "Diametro femoral": "",
  });

  const [resultados, setResultados] = useState([]);
  const [mediciones, setMediciones] = useState([]);

  const sexoFactor = (sexo) => (sexo === "M" ? 1 : 0);

  const calcularResultados = (datos) => {
    const {
    Peso,
    Talla,
    "Pliegue subescapular": subescapular,
    "Pliegue tricipital": tricipital,
    "Pliegue bicipital": bicipital,
    "Pliegue supraespinal": supraespinal,
    "Pliegue ileocrestal": ileocrestal,
    "Pliegue abdominal": abdominal,
    "Pliegue muslo": musloPliegue,
    "Pliegue pantorrilla": pantorrillaPliegue,
    "Diametro biestiloideo": biestiloideo,
    "Diametro femoral": femoral,
    edad,
    sexo,
    } = datos;

    const sumaPliegues =
      parseFloat(tricipital) +
      parseFloat(bicipital) +
      parseFloat(subescapular) +
      parseFloat(supraespinal) +
      parseFloat(ileocrestal) +
      parseFloat(abdominal) +
      parseFloat(musloPliegue) +
      parseFloat(pantorrillaPliegue);

    const imc = Peso && Talla ? Peso / Math.pow(Talla / 100, 2) : 0;

    const porcentajeGrasa = sumaPliegues * 0.153 + 5.783;

    const masaMuscularKg =
      0.244 * Peso +
      7.8 * (Talla / 100) +
      6.6 * sexoFactor(sexo) -
      0.098 * edad -
      3.3;

    const porcentaje_masa_muscular = Peso ? (masaMuscularKg / Peso) * 100 : 0;

    const masaOsea2 = 3.02 * ((Talla * Talla * biestiloideo * femoral * 400 /100000000) ** 0.712);

    const masaOsea = (masaOsea2 / Peso) * 100;

    const masaGrasaKg = (Peso * porcentajeGrasa) / 100;

    const factor2 = sexo === "M" ? 0.209 : 0.241;

    const masaResidual = (Peso - (masaGrasaKg + masaMuscularKg + masaOsea2)) * factor2;

    ({
      imc,
      sumaPliegues,
      porcentajeGrasa,
      masaMuscularKg,
      porcentaje_masa_muscular,
      masaOsea,
      masaResidual,
    });

    setResultados({
      "Indice de masa corporal (IMC)": imc.toFixed(2),
      "Suma de pliegues": sumaPliegues.toFixed(2),
      "Porcentaje de grasa": porcentajeGrasa.toFixed(2),
      "Masa muscular (kg)": porcentaje_masa_muscular.toFixed(2),
      "Masa muscular %": porcentaje_masa_muscular.toFixed(2),
      "Masa osea %": masaOsea.toFixed(2),
      "Masa residual": masaResidual.toFixed(2),
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedDatos = { ...datos, [name]: value };
    setDatos(updatedDatos);
    calcularResultados(updatedDatos); 
  };

  const handleAgregarMedicion = async () => {
    if (!validarDatos(datos)) {
      return;
    }
  
    const medicionTransformada = transformMedicionesData2([datos])[0];
    const medicionConId = { ...medicionTransformada, id_consulta: idConsulta };
  
    console.log("Datos transformados para enviar al backend:", medicionConId);
  
    try {
      const response = await crearMediciones(medicionConId); 
      console.log("Medición guardada correctamente en el backend.");
      console.log("Datos enviados:", response);
      
      Swal.fire({
        icon: 'success',
        title: 'Medición guardada exitosamente',
        showConfirmButton: true,
        timer: 1500
      });   
      const id_medicion = response?.body?.medicion?.id_medicion; 
      if (id_medicion) {
        await enviarResultados(id_medicion);
      } else {
        console.error("No se pudo obtener id_medicion de la respuesta.");
      }

    } catch (error) {
  
    }
  };

  const validarDatos = () => {
    const camposRequeridos = ["Peso", "Talla", "Perímetro brazo relajado", "Perímetro brazo tensión"];
    for (const campo of camposRequeridos) {
      if (!datos[campo] || isNaN(datos[campo])) {
        alert(`El campo ${campo} es obligatorio y debe ser un número válido.`);
        return false;
      }
    }
    return true;
  };

  const enviarResultados = async (id_medicion) => {
    const resultadosTransformados = {
      id_medicion: id_medicion, 
      imc: resultados["Indice de masa corporal (IMC)"],
      suma_pliegues: resultados["Suma de pliegues"],
      porcentaje_grasa: resultados["Porcentaje de grasa"],
      masa_muscular_kg: resultados["Masa muscular (kg)"],
      porcentaje_masa_muscular: resultados["Masa muscular %"],
      masa_osea: resultados["Masa osea %"],
      masa_residual: resultados["Masa residual"],
    };
  
    console.log("Resultados transformados para enviar al backend:", resultadosTransformados);
  
    try {
      await crearResultados(resultadosTransformados); // Envía los resultados al backend
      console.log("Resultados guardados correctamente en el backend.");
  
      Swal.fire({
        icon: 'success',
        title: 'Calculos guardados exitosamente',
        showConfirmButton: true,
        timer: 1500
      });
    } catch (error) {
      console.error("Error al guardar los resultados:", error);
      alert(`Error al guardar los resultados: ${error.message || "Por favor, inténtelo de nuevo."}`);
    }
  };
    
  const transformMedicionesData = (data) => {
    return data.map((item) => ({
      Peso: item.peso,
      Talla: item.talla,
      "Pliegue tricipital": item.pl_tricipital,
      "Pliegue bicipital": item.pl_bicipital,
      "Pliegue subescapular": item.pl_subescapular,
      "Pliegue supraespinal": item.pl_supraespinal,
      "Pliegue ileocrestal": item.pl_suprailiaco,
      "Pliegue abdominal": item.pl_abdominal,
      "Pliegue muslo": item.pl_muslo_medial,
      "Pliegue pantorrilla": item.pl_pantorrilla_medial,
      "Perímetro brazo relajado": item.per_brazo_reposo,
      "Perímetro brazo tensión": item.per_brazo_flex,
      "Perímetro muslo": item.per_muslo_medio,
      "Perímetro pantorrilla": item.per_pantorrilla_medial,
      "Perímetro cintura": item.per_cintura,
      "Perímetro cadera": item.per_cadera,
      "Diametro femoral": item.diametro_femoral,
      "Diametro biestiloideo": item.diametro_biestiloideo,
      "Diametro humeral": item.diametro_humeral,
    }));
  };

  const transformMedicionesData2 = (data) => {
    return data.map((item) => ({
      peso: item.Peso,
      talla: item.Talla,
      pl_tricipital: item["Pliegue tricipital"],
      pl_bicipital: item["Pliegue bicipital"],
      pl_subescapular: item["Pliegue subescapular"],
      pl_supraespinal: item["Pliegue supraespinal"],
      pl_suprailiaco: item["Pliegue ileocrestal"],
      pl_abdominal: item["Pliegue abdominal"],
      pl_muslo_medial: item["Pliegue muslo"],
      pl_pantorrilla_medial: item["Pliegue pantorrilla"],
      per_brazo_reposo: item["Perímetro brazo relajado"],
      per_brazo_flex: item["Perímetro brazo tensión"],
      per_muslo_medio: item["Perímetro muslo"],
      per_pantorrilla_medial: item["Perímetro pantorrilla"],
      per_cintura: item["Perímetro cintura"],
      per_cadera: item["Perímetro cadera"],
      diametro_femoral: item["Diametro femoral"],
      diametro_biestiloideo: item["Diametro biestiloideo"],
      diametro_humeral: item["Diametro humeral"],
    }));
  };

  const transformarResultados = (data) => {
    return {
      "Indice de masa corporal (IMC)": data.imc || "N/A",
      "Suma de pliegues": data.suma_pliegues || "N/A",
      "Porcentaje de grasa": data.porcentaje_grasa || "N/A",
      "Masa muscular (kg)": data.masa_muscular_kg || "N/A",
      "Masa muscular %": data.porcentaje_masa_muscular || "N/A", // Mapeo correcto
      "Masa osea %": data.masa_osea || "N/A",
      "Masa residual": data.masa_residual || "N/A",
    };
  };

  const medicionTransformada = medicion.length > 0 ? transformMedicionesData([medicion[0]])[0] : {};
  

  useEffect(() => {
    const cargarResultados = async () => {
      try {
        if (idConsulta) {
          const data = await obetenerresultadosPorPaciente(idPaciente);
          console.log("Resultados obtenidos desde el backend:", data);
          if (data && data.length > 0) {
            const resultadosTransformados = data.map((resultado) => transformarResultados(resultado));
            setResultados(resultadosTransformados); // Actualiza el estado con todos los resultados transformados
          } else {
            console.error("No se encontraron resultados para el paciente.");
          }
        } else {
          console.error("El ID de la consulta no está definido.");
        }
      } catch (error) {
        console.error("Error al cargar los resultados:", error);
      }
    };
  
    cargarResultados();
  }, [idPaciente]);
  
  useEffect(() => {
    const cargarMediciones = async () => {
      try {
        if (idConsulta) {
          const medicionesRecuperadas = await obtenerMedicionesPorPaciente(idPaciente);
          console.log("Mediciones obtenidas desde el backend:", medicionesRecuperadas);
          setMediciones(medicionesRecuperadas); // Actualiza el estado con las mediciones recuperadas
        } else {
          console.error("El ID de la consulta no está definido.");
        }
      } catch (error) {
        console.error("Error al cargar las mediciones:", error);
      }
    };
  
    cargarMediciones();
  }, [idPaciente]);

  
  

return (
  <div className="mediciones-formulario" style={{marginTop: "90px", maxWidth: "1200px", minHeight: "800px", overflow: "hidden",  }}>

    <div className="consulta-header">
      <h1 className="consulta-titulo">Formulario de Mediciones</h1>
    </div>

      <div className="mediciones-container"style={{padding: "20px", backgroundColor: "#f9f9f9", borderRadius: "10px", boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",}}>
        <h3>Datos Generales</h3>
        <Form className="row" style={{ marginBottom: "5px" }}>
         <FormGroup className="col">
          <Label for="Peso">Peso (kg)</Label>
          <Input
            type="number"
            name="Peso"
            value={datos.Peso}
            onChange={handleChange}
          />
          </FormGroup>
         <FormGroup className="col">
          <Label for="Talla">Talla (cm)</Label>
          <Input
            type="number"
            name="Talla"
            value={datos.Talla}
            onChange={handleChange}
          />
          </FormGroup>

        <FormGroup className="col">
          <Label for="edad">Edad </Label>
          <Input
            type="number"
            name="edad"
            value={datos.edad}
            onChange={handleChange}
          />
          </FormGroup>

         <FormGroup className="col">
          <Label for="sexo">Sexo</Label>
          <Input
            type="select"
            name="sexo"
            value={datos.sexo}
            onChange={handleChange}
          >
            <option value="" disabled>Seleccione</option>
            <option value="M">M</option>
            <option value="F">F</option>
          </Input>
          </FormGroup>
          <FormGroup className="col">
          <Label for="fecha">Fecha</Label>
          <Input
            type="date"
            name="fecha"
            value={new Date().toISOString().split("T")[0]} // Fecha actual
            readOnly
          />
          </FormGroup>
        </Form>
      
      <h3 >Perímetros Corporales (cm)</h3>
      <Form className="row" style={{ marginBottom: "5px" }}>
        <FormGroup className="col">
          <Label for="Perímetro brazo relajado">Brazo Relajado</Label>
          <Input
            type="number"
            name="Perímetro brazo relajado"
            value={datos["Perímetro brazo relajado"]}
            onChange={handleChange}
          />
        </FormGroup>
        <FormGroup className="col">
          <Label for="brazoTension">Brazo en Tensión</Label>
          <Input
            type="number"
            name="Perímetro brazo tensión"
            value={datos["Perímetro brazo tensión"]}
            onChange={handleChange}
          />
        </FormGroup>
        <FormGroup className="col">
          <Label for="muslo">Muslo</Label>
          <Input
            type="number"
            name="Perímetro muslo"
            value={datos["Perímetro muslo"]}
            onChange={handleChange}
          />
        </FormGroup>
         
        <FormGroup className="col"> 
          <Label for="pantorrilla">Pantorrilla</Label>
          <Input
            type="number"
            name="Perímetro pantorrilla"
            value={datos["Perímetro pantorrilla"]}
            onChange={handleChange}
          />
        </FormGroup>
        <FormGroup className="col">
          <Label for="cintura">Cintura</Label>
          <Input
            type="number"
            name="Perímetro cintura"
            value={datos["Perímetro cintura"]}
            onChange={handleChange}
          />
        </FormGroup>
        <FormGroup className="col">
          <Label for="cadera">Cadera</Label>
          <Input
            type="number"
            name="Perímetro cadera"
            value={datos["Perímetro cadera"]}
            onChange={handleChange}
          />
        </FormGroup>
      </Form>
    
      <h3>Pliegues Cutáneos (mm)</h3>
      <Form className="row" style={{ marginBottom: "5px" }}>
        <FormGroup className="col">
          <Label for="subescapular">Subescapular</Label>
          <Input
            type="number"
            name="Pliegue subescapular"
            value={datos["Pliegue subescapular"]}
            onChange={handleChange}
          />
        </FormGroup>
        <FormGroup className="col">
          <Label for="tricipital">Tricipital</Label>
          <Input
            type="number"
            name="Pliegue tricipital"
            value={datos["Pliegue tricipital"]}
            onChange={handleChange}
          />
        </FormGroup>
        <FormGroup className="col">
          <Label for="bicipital">Bicipital</Label>
          <Input
            type="number"
            name="Pliegue bicipital"
            value={datos["Pliegue bicipital"]}
            onChange={handleChange}
          />
        </FormGroup>
        <FormGroup className="col">
          <Label for="supraespinal">Supraespinal</Label>
          <Input
            type="number"
            name="Pliegue supraespinal"
            value={datos["Pliegue supraespinal"]}
            onChange={handleChange}
          />
        </FormGroup>
        <FormGroup className="col">
          <Label for="ileocrestal">Ileocrestal</Label>
          <Input
            type="number"
            name="Pliegue ileocrestal"
            value={datos["Pliegue ileocrestal"]}
            onChange={handleChange}
          />
        </FormGroup>
        <FormGroup className="col">
          <Label for="abdominal">Abdominal</Label>
          <Input
            type="number"
            name="Pliegue abdominal"
            value={datos["Pliegue abdominal"]}
            onChange={handleChange}
          />
        </FormGroup>
      </Form>
      <Form className="row" style={{ marginBottom: "5px" }}>
        <FormGroup className="col">
          <Label for="musloPliegue">Muslo</Label>
          <Input
            type="number"
            name="Pliegue muslo"
            value={datos["Pliegue muslo"]}
            onChange={handleChange}
          />
        </FormGroup>
        <FormGroup className="col">
          <Label for="pantorrillaPliegue">Pantorrilla</Label>
          <Input
            type="number"
            name="Pliegue pantorrilla"
            value={datos["Pliegue pantorrilla"]}
            onChange={handleChange}
          />
        </FormGroup>      
      </Form>
      <h3>Diametros oseos (cm)</h3>
        <Form className="row" style={{ marginBottom: "5px" }}>
         <FormGroup className="col">
          <Label for="peso">Biestiloideo</Label>
          <Input
            type="number"
            name="Diametro biestiloideo"
            value={datos["Diametro biestiloideo"]}
            onChange={handleChange}
          />
          </FormGroup>
         <FormGroup className="col">
          <Label for="talla">Femoral</Label>
          <Input
            type="number"
            name="Diametro femoral"
            value={datos["Diametro femoral"]}
            onChange={handleChange}
          />
          </FormGroup>

        <FormGroup className="col">
          <Label for="talla">Humeral</Label>
          <Input
            type="number"
            name="Diametro humeral"
            value={datos["Diametro humeral"]}
            onChange={handleChange}
          />
          </FormGroup>
        </Form>
      <Button
          className="col"
          onClick={async () => {
            await handleAgregarMedicion();
          }}
          style={{
            margin: "20px auto",
            backgroundColor: "rgb(12, 48, 70)",
            borderColor: "rgb(12, 48, 70)",
          }}
        >
          Agregar Medición
        </Button>
      </div>
    
    <div className="tabla-resultados" style={{ marginTop: "20px" }}>
    <div className="consulta-header">
      <h1 className="consulta-titulo">Historial de Mediciones</h1>
    </div>

    <Table striped bordered>
  <thead>
    <tr>
      <th>#</th>
      {resultados.length > 0 &&
        Object.keys(resultados[0]).map((indicador) => (
          <th key={`header-${indicador}`}>{indicador}</th>
        ))}
    </tr>
  </thead>
  <tbody>
    {resultados.map((resultado, index) => (
      <tr key={`resultado-${index}`}>
        <td>{index + 1}</td>
        {Object.values(resultado).map((valor, i) => (
          <td key={`valor-${index}-${i}`}>{valor || "N/A"}</td>
        ))}
      </tr>
    ))}
  </tbody>
</Table>

<Table striped bordered>
  <thead>
    <tr>
      <th>Indicador</th>
      {mediciones.map((medicion, index) => (
        <th key={`header-${index}`}>Valor</th> 
      ))}
    </tr>
  </thead>
  <tbody>
    {[
      { nombre: "Peso (kg)", clave: "peso" },
      { nombre: "Talla (cm)", clave: "talla" },
      { nombre: "Perímetro brazo relajado (cm)", clave: "per_brazo_reposo" },
      { nombre: "Perímetro brazo tensión (cm)", clave: "per_brazo_flex" },
      { nombre: "Perímetro muslo (cm)", clave: "per_muslo_medio" },
      { nombre: "Perímetro pantorrilla (cm)", clave: "per_pantorrilla_medial" },
      { nombre: "Perímetro cintura (cm)", clave: "per_cintura" },
      { nombre: "Perímetro cadera (cm)", clave: "per_cadera" },
      { nombre: "Pliegue subescapular (mm)", clave: "pl_subescapular" },
      { nombre: "Pliegue tricipital (mm)", clave: "pl_tricipital" },
      { nombre: "Pliegue bicipital (mm)", clave: "pl_bicipital" },
      { nombre: "Pliegue supraespinal (mm)", clave: "pl_supraespinal" },
      { nombre: "Pliegue ileocrestal (mm)", clave: "pl_suprailiaco" },
      { nombre: "Pliegue abdominal (mm)", clave: "pl_abdominal" },
      { nombre: "Pliegue muslo (mm)", clave: "pl_muslo_medial" },
      { nombre: "Pliegue pantorrilla (mm)", clave: "pl_pantorrilla_medial" },
      { nombre: "Diámetro humeral (cm)", clave: "diametro_humeral" },
      { nombre: "Diámetro biestiloideo (cm)", clave: "diametro_biestiloideo" },
      { nombre: "Diámetro femoral (cm)", clave: "diametro_femoral" },
    ].map(({ nombre, clave }) => (
      <tr key={clave}>
        <td><strong>{nombre}</strong></td> 
        {mediciones.map((medicion, index) => (
          <td key={`data-${index}-${clave}`}>{medicion[clave] || "N/A"}</td> 
        ))}
      </tr>
    ))}
  </tbody>
</Table>
</div>
<div className="consulta-header">
  <h1 className="consulta-titulo">Grafico de Mediciones</h1>
</div>
<div className="mediciones-container"> 
<ResponsiveContainer width="100%" height={400}>
  <GraficoResultadosCompuesto resultados={resultados} />
</ResponsiveContainer>
</div>
<Button
  className="col"
  onClick={async () => {
    const pdf = new jsPDF("p", "mm", "a4"); // Crear un documento PDF en formato A4

    // Agregar título al PDF
    pdf.setFontSize(18);
    pdf.text("Reporte del Paciente", 10, 20); // Título principal
    pdf.setFontSize(12);
    pdf.text(`ID del Paciente: ${idPaciente}`, 10, 30); // ID del paciente

    // Capturar la tabla de resultados
    const tablaResultados = document.querySelector(".tabla-resultados"); // Selecciona la tabla de resultados
    const canvasTabla = await html2canvas(tablaResultados, { scale: 2 }); // Captura la tabla como un canvas
    const imgTabla = canvasTabla.toDataURL("image/png"); // Convierte el canvas a una imagen en formato PNG

    // Ajustar dimensiones de la imagen para el PDF
    const imgWidthTabla = 190; // Ancho del PDF en mm (margen de 10 mm)
    const imgHeightTabla = (canvasTabla.height * imgWidthTabla) / canvasTabla.width; // Calcula la altura proporcional

    // Agregar la tabla de resultados al PDF
    pdf.addImage(imgTabla, "PNG", 10, 40, imgWidthTabla, imgHeightTabla);

    // Retraso para asegurar que el gráfico esté completamente renderizado
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Capturar el gráfico estadístico
    const graficoEstadistico = document.querySelector(".mediciones-container"); // Selecciona el contenedor del gráfico
    const canvasGrafico = await html2canvas(graficoEstadistico, { scale: 2 }); // Captura el gráfico como un canvas
    const imgGrafico = canvasGrafico.toDataURL("image/png"); // Convierte el canvas a una imagen en formato PNG

    // Ajustar dimensiones de la imagen para el PDF
    const imgWidthGrafico = 190; // Ancho del PDF en mm (margen de 10 mm)
    const imgHeightGrafico = (canvasGrafico.height * imgWidthGrafico) / canvasGrafico.width; // Calcula la altura proporcional

    // Agregar el gráfico estadístico al PDF
    const yPositionGrafico = 40 + imgHeightTabla + 10; // Posición debajo de la tabla
    pdf.addImage(imgGrafico, "PNG", 10, yPositionGrafico, imgWidthGrafico, imgHeightGrafico);

    // Guardar el PDF
    pdf.save(`Reporte_Paciente_${idPaciente}.pdf`);
  }}
  style={{
    margin: "20px auto",
    backgroundColor: "rgb(12, 48, 70)",
    borderColor: "rgb(12, 48, 70)",
  }}
>
  Generar Reporte PDF
</Button>
</div>
  );
}