import React, { useState, useEffect, use } from "react";
import { Table, Form, FormGroup, Label, Input, Button } from "reactstrap";
import "../css/mediciones.css";
import { useResultados } from "../context/ResultadosContext";
import { useMediciones } from "../context/MedicionesContext";
import { usePacientes } from "../context/PacientesContext";
import Swal from 'sweetalert2';
import {  ResponsiveContainer } from "recharts";
import { GraficoResultadosCompuesto } from "./GraficoResultadosCompuesto";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { FaEdit, FaTrash } from "react-icons/fa";

export default function Mediciones({ idConsulta, idPaciente }) {
  const { crearMediciones, medicion, obtenerMedicionesPorPaciente, actualizarMedicion, eliminarMedicion } = useMediciones();
  const { crearResultados, resultadoContext, obtenerResultadosPorPaciente  } = useResultados();
  const { obtenerPacientePorId } = usePacientes();
  
  const [pacienteInfo, setPacienteInfo] = useState(null);

  const [datos, setDatos] = useState({
    Peso: "",
    Talla: "",
    edad: "",
    sexo: "",
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
  
  // Estados para manejar la edición
  const [editandoMedicion, setEditandoMedicion] = useState(null);
  const [datosEdicion, setDatosEdicion] = useState({});

  // Función para calcular la edad desde la fecha de nacimiento
  const calcularEdad = (fechaNacimiento) => {
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    
    return edad;
  };

  // Cargar información del paciente
  const cargarPaciente = async () => {
    try {
      if (idPaciente) {
        const paciente = await obtenerPacientePorId(idPaciente);
        console.log("Información del paciente:", paciente);
        setPacienteInfo(paciente);
        
        // Actualizar los datos con la edad calculada y el sexo
        if (paciente) {
          const edad = calcularEdad(paciente.fecha_nacimiento);
          setDatos(prev => ({
            ...prev,
            edad: edad.toString(),
            sexo: paciente.sexo
          }));
        }
      }
    } catch (error) {
      console.error("Error al cargar información del paciente:", error);
    }
  };

  const sexoFactor = (sexo) => (sexo === "M" ? 1 : 0);

  const calcularResultados = (datos) => {
    console.log("🧮 calcularResultados - Datos recibidos:", datos);
    
    const {
    Peso,
    peso,
    Talla,
    talla,
    pl_subescapular,
    pl_tricipital,
    pl_bicipital,
    pl_supraespinal,
    pl_suprailiaco, // Nota: transformMedicionesData2 usa pl_suprailiaco, no pl_ileocrestal
    pl_abdominal,
    pl_muslo_medial,
    pl_pantorrilla_medial,
    diametro_biestiloideo,
    diametro_femoral,
    edad,
    sexo,
    // También aceptar nombres originales por compatibilidad
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
    } = datos;

    // Usar valores transformados si existen, sino usar originales
    const pesoFinal = peso || Peso;
    const tallaFinal = talla || Talla;
    const tricipitalFinal = pl_tricipital || tricipital;
    const bicipitalFinal = pl_bicipital || bicipital;
    const subescapularFinal = pl_subescapular || subescapular;
    const supraespinalFinal = pl_supraespinal || supraespinal;
    const ileo_suprailiaco = pl_suprailiaco || ileocrestal; // pl_suprailiaco es lo mismo que ileocrestal
    const abdominalFinal = pl_abdominal || abdominal;
    const musloFinal = pl_muslo_medial || musloPliegue;
    const pantorrillaFinal = pl_pantorrilla_medial || pantorrillaPliegue;
    const biestiloideoFinal = diametro_biestiloideo || biestiloideo;
    const femoralFinal = diametro_femoral || femoral;

    console.log("📊 Datos extraídos para cálculo:");
    console.log("Peso:", pesoFinal, "Talla:", tallaFinal, "Edad:", edad, "Sexo:", sexo);
    console.log("Pliegues - Tricipital:", tricipitalFinal, "Bicipital:", bicipitalFinal, "Subescapular:", subescapularFinal);
    console.log("Pliegues - Supraespinal:", supraespinalFinal, "Ileocrestal/Suprailiaco:", ileo_suprailiaco, "Abdominal:", abdominalFinal);
    console.log("Pliegues - Muslo:", musloFinal, "Pantorrilla:", pantorrillaFinal);
    console.log("Diámetros - Biestiloideo:", biestiloideoFinal, "Femoral:", femoralFinal);

    // Validar que tenemos datos necesarios antes de calcular
    if (!pesoFinal || !tallaFinal || !edad || !sexo) {
      console.log("❌ Faltan datos necesarios para el cálculo:");
      console.log("Peso:", pesoFinal, "Talla:", tallaFinal, "Edad:", edad, "Sexo:", sexo);
      return; // No calcular si no hay datos suficientes
    }

    const sumaPliegues =
      parseFloat(tricipitalFinal || 0) +
      parseFloat(bicipitalFinal || 0) +
      parseFloat(subescapularFinal || 0) +
      parseFloat(supraespinalFinal || 0) +
      parseFloat(ileo_suprailiaco || 0) +
      parseFloat(abdominalFinal || 0) +
      parseFloat(musloFinal || 0) +
      parseFloat(pantorrillaFinal || 0);

    console.log("📈 Suma de pliegues calculada:", sumaPliegues);

    const imc = pesoFinal && tallaFinal ? pesoFinal / Math.pow(tallaFinal / 100, 2) : 0;

    const porcentajeGrasa = sumaPliegues * 0.153 + 5.783;

    const masaMuscularKg =
      0.244 * pesoFinal +
      7.8 * (tallaFinal / 100) +
      6.6 * sexoFactor(sexo) -
      0.098 * edad -
      3.3;

    const porcentaje_masa_muscular = pesoFinal ? (masaMuscularKg / pesoFinal) * 100 : 0;

    const masaOsea2 = 3.02 * ((tallaFinal * tallaFinal * (parseFloat(biestiloideoFinal) || 0) * (parseFloat(femoralFinal) || 0) * 400 /100000000) ** 0.712);

    const masaOsea = (masaOsea2 / pesoFinal) * 100;

    console.log("🦴 Masa ósea - Biestiloideo:", biestiloideoFinal, "Femoral:", femoralFinal, "Masa ósea calculada:", masaOsea);

    const masaGrasaKg = (pesoFinal * porcentajeGrasa) / 100;

    const factor2 = sexo === "M" ? 0.209 : 0.241;

    const masaResidual = (pesoFinal - (masaGrasaKg + masaMuscularKg + masaOsea2)) * factor2;

    console.log("🎯 Resultados calculados:");
    console.log("IMC:", imc.toFixed(2));
    console.log("Suma pliegues:", sumaPliegues.toFixed(2));
    console.log("% Grasa:", porcentajeGrasa.toFixed(2));
    console.log("Masa muscular kg:", masaMuscularKg.toFixed(2));
    console.log("% Masa muscular:", porcentaje_masa_muscular.toFixed(2));
    console.log("% Masa ósea:", masaOsea.toFixed(2));
    console.log("Masa residual:", masaResidual.toFixed(2));

    // Este estado debe mantener el formato de array para ser consistente
    // con los datos que vienen del backend
    const resultadoCalculado = {
      "Indice de masa corporal (IMC)": imc.toFixed(2),
      "Suma de pliegues": sumaPliegues.toFixed(2),
      "Porcentaje de grasa": porcentajeGrasa.toFixed(2),
      "Masa muscular (kg)": masaMuscularKg.toFixed(2),
      "Masa muscular %": porcentaje_masa_muscular.toFixed(2),
      "Masa osea %": masaOsea.toFixed(2),
      "Masa residual": masaResidual.toFixed(2),
    };

    // No sobrescribir resultados del backend, solo mostrar calculos temporales
    // cuando no hay resultados guardados
    if (!resultados || resultados.length === 0) {
      setResultados([resultadoCalculado]);
    }
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
      console.log("Respuesta completa:", response);
      console.log("Estructura response.body:", response?.body);
      console.log("Estructura response.body.medicion:", response?.body?.medicion);
      
      Swal.fire({
        icon: 'success',
        title: 'Medición guardada exitosamente',
        showConfirmButton: true,
        timer: 1500
      });   
      
      // Intentar diferentes rutas para obtener el id_medicion
      let id_medicion = response?.body?.medicion?.id_medicion || 
                       response?.medicion?.id_medicion || 
                       response?.data?.body?.medicion?.id_medicion ||
                       response?.data?.medicion?.id_medicion;
                       
      console.log("ID medición extraído:", id_medicion);
      
      if (id_medicion) {
        await enviarResultados(id_medicion);
        // Recargar mediciones y resultados después de guardar
        await cargarMediciones();
        await cargarResultados();
      } else {
        console.error("No se pudo obtener id_medicion de la respuesta.");
        console.error("Respuesta completa para debug:", JSON.stringify(response, null, 2));
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
    console.log("enviarResultados - Iniciando con ID:", id_medicion);
    console.log("Estado actual de datos:", datos);
    console.log("Información del paciente disponible:", pacienteInfo);
    
    // Primero calcular los resultados
    const resultadosCalculados = calcularResultadosCompletos(datos);
    
    if (!resultadosCalculados) {
      console.error("No se pudieron calcular los resultados");
      console.error("Datos actuales:", datos);
      console.error("¿Paciente cargado?", !!pacienteInfo);
      return;
    }

    console.log("Resultados calculados exitosamente:", resultadosCalculados);

    const resultadosTransformados = {
      id_medicion: id_medicion, 
      imc: resultadosCalculados.imc,
      suma_pliegues: resultadosCalculados.sumaPliegues,
      porcentaje_grasa: resultadosCalculados.porcentajeGrasa,
      masa_muscular_kg: resultadosCalculados.masaMuscularKg,
      porcentaje_masa_muscular: resultadosCalculados.porcentaje_masa_muscular,
      masa_osea: resultadosCalculados.masaOsea,
      masa_residual: resultadosCalculados.masaResidual,
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
      
      // Recargar resultados después de guardar
      await cargarResultados();
    } catch (error) {
      console.error("Error al guardar los resultados:", error);
      alert(`Error al guardar los resultados: ${error.message || "Por favor, inténtelo de nuevo."}`);
    }
  };

  // Función separada para calcular resultados y retornar valores
  const calcularResultadosCompletos = (datos) => {
    console.log("calcularResultadosCompletos - Datos recibidos:", datos);
    
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

    console.log("Datos extraídos para cálculo:");
    console.log("Peso:", Peso, "Talla:", Talla, "Edad:", edad, "Sexo:", sexo);
    console.log("Información del paciente:", pacienteInfo);

    // Validar que tenemos datos necesarios antes de calcular
    if (!Peso || !Talla || !edad || !sexo) {
      console.error("Faltan datos necesarios para el cálculo:");
      console.error("Peso:", Peso, "Talla:", Talla, "Edad:", edad, "Sexo:", sexo);
      return null; // No calcular si no hay datos suficientes
    }

    const sumaPliegues =
      parseFloat(tricipital || 0) +
      parseFloat(bicipital || 0) +
      parseFloat(subescapular || 0) +
      parseFloat(supraespinal || 0) +
      parseFloat(ileocrestal || 0) +
      parseFloat(abdominal || 0) +
      parseFloat(musloPliegue || 0) +
      parseFloat(pantorrillaPliegue || 0);

    const imc = Peso && Talla ? Peso / Math.pow(Talla / 100, 2) : 0;

    const porcentajeGrasa = sumaPliegues * 0.153 + 5.783;

    const masaMuscularKg =
      0.244 * Peso +
      7.8 * (Talla / 100) +
      6.6 * sexoFactor(sexo) -
      0.098 * edad -
      3.3;

    const porcentaje_masa_muscular = Peso ? (masaMuscularKg / Peso) * 100 : 0;

    const masaOsea2 = 3.02 * ((Talla * Talla * (biestiloideo || 0) * (femoral || 0) * 400 /100000000) ** 0.712);

    const masaOsea = (masaOsea2 / Peso) * 100;

    const masaGrasaKg = (Peso * porcentajeGrasa) / 100;

    const factor2 = sexo === "M" ? 0.209 : 0.241;

    const masaResidual = (Peso - (masaGrasaKg + masaMuscularKg + masaOsea2)) * factor2;

    return {
      imc,
      sumaPliegues,
      porcentajeGrasa,
      masaMuscularKg,
      porcentaje_masa_muscular,
      masaOsea,
      masaResidual,
    };
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
  
  // Función para cargar resultados
  const cargarResultados = async () => {
    try {
      if (idConsulta && idPaciente) {
        const data = await obtenerResultadosPorPaciente(idPaciente);
        console.log("Resultados obtenidos desde el backend:", data);
        if (data && Array.isArray(data) && data.length > 0) {
          const resultadosTransformados = data.map((resultado) => transformarResultados(resultado));
          setResultados(resultadosTransformados);
        } else {
          console.log("No se encontraron resultados para el paciente.");
          setResultados([]); // Establece un array vacío
        }
      } else {
        console.error("El ID de la consulta o del paciente no está definido.");
      }
    } catch (error) {
      console.error("Error al cargar los resultados:", error);
      setResultados([]); // En caso de error, establece un array vacío
    }
  };

  // Función para cargar mediciones
  const cargarMediciones = async () => {
    try {
      if (idConsulta && idPaciente) {
        const medicionesRecuperadas = await obtenerMedicionesPorPaciente(idPaciente);
        console.log("Mediciones obtenidas desde el backend:", medicionesRecuperadas);
        if (Array.isArray(medicionesRecuperadas)) {
          setMediciones(medicionesRecuperadas);
        } else {
          console.log("No se encontraron mediciones para el paciente.");
          setMediciones([]); // Establece un array vacío
        }
      } else {
        console.error("El ID de la consulta o del paciente no está definido.");
      }
    } catch (error) {
      console.error("Error al cargar las mediciones:", error);
      setMediciones([]); // En caso de error, establece un array vacío
    }
  };

  useEffect(() => {
    cargarPaciente();
  }, [idPaciente]);

  useEffect(() => {
    cargarResultados();
  }, [idPaciente]);
  
  useEffect(() => {
    cargarMediciones();
  }, [idPaciente]);

  // Funciones para manejar edición y eliminación de mediciones
  const handleEditarMedicion = (medicion) => {
    setEditandoMedicion(medicion.id_medicion);
    setDatosEdicion({
      peso: medicion.peso,
      talla: medicion.talla,
      pl_tricipital: medicion.pl_tricipital,
      pl_bicipital: medicion.pl_bicipital,
      pl_subescapular: medicion.pl_subescapular,
      pl_supraespinal: medicion.pl_supraespinal,
      pl_suprailiaco: medicion.pl_suprailiaco,
      pl_abdominal: medicion.pl_abdominal,
      pl_muslo_medial: medicion.pl_muslo_medial,
      pl_pantorrilla_medial: medicion.pl_pantorrilla_medial,
      per_brazo_reposo: medicion.per_brazo_reposo,
      per_brazo_flex: medicion.per_brazo_flex,
      per_muslo_medio: medicion.per_muslo_medio,
      per_pantorrilla_medial: medicion.per_pantorrilla_medial,
      per_cintura: medicion.per_cintura,
      per_cadera: medicion.per_cadera,
      diametro_femoral: medicion.diametro_femoral,
      diametro_biestiloideo: medicion.diametro_biestiloideo,
      diametro_humeral: medicion.diametro_humeral
    });
  };

  const handleGuardarEdicion = async () => {
    try {
      await actualizarMedicion(editandoMedicion, datosEdicion);
      setEditandoMedicion(null);
      setDatosEdicion({});
      
      // Recargar datos
      await cargarMediciones();
      await cargarResultados();
      
      Swal.fire({
        icon: 'success',
        title: 'Medición actualizada exitosamente',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error) {
      console.error("Error al actualizar medición:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error al actualizar la medición',
        text: 'Inténtalo de nuevo'
      });
    }
  };

  const handleCancelarEdicion = () => {
    setEditandoMedicion(null);
    setDatosEdicion({});
  };

  const handleEliminarMedicion = async (idMedicion) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: '¿Deseas eliminar esta medición? Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await eliminarMedicion(idMedicion);
        
        // Recargar datos
        await cargarMediciones();
        await cargarResultados();
        
        Swal.fire({
          title: 'Eliminado',
          text: 'La medición ha sido eliminada exitosamente.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
      } catch (error) {
        console.error("Error al eliminar medición:", error);
        Swal.fire({
          title: 'Error',
          text: 'No se pudo eliminar la medición. Inténtalo de nuevo.',
          icon: 'error'
        });
      }
    }
  };

  const handleCambioEdicion = (campo, valor) => {
    setDatosEdicion(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

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
            readOnly
            style={{ backgroundColor: "#f8f9fa" }}
          />
          </FormGroup>

         <FormGroup className="col">
          <Label for="sexo">Sexo</Label>
          <Input
            type="text"
            name="sexo"
            value={datos.sexo === 'M' ? 'Masculino' : datos.sexo === 'F' ? 'Femenino' : ''}
            readOnly
            style={{ backgroundColor: "#f8f9fa" }}
          />
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
      {resultados.length > 0 && Array.isArray(resultados) &&
        Object.keys(resultados[0]).map((indicador) => (
          <th key={`header-${indicador}`}>{indicador}</th>
        ))}
    </tr>
  </thead>
  <tbody>
    {Array.isArray(resultados) && resultados.map((resultado, index) => (
      <tr key={`resultado-${index}`}>
        <td>{index + 1}</td>
        {Object.values(resultado).map((valor, i) => (
          <td key={`valor-${index}-${i}`}>{valor || "N/A"}</td>
        ))}
      </tr>
    ))}
    {(!Array.isArray(resultados) || resultados.length === 0) && (
      <tr>
        <td colSpan="100%" style={{ textAlign: 'center', padding: '20px' }}>
          No hay resultados disponibles para este paciente
        </td>
      </tr>
    )}
  </tbody>
</Table>

<Table striped bordered>
  <thead>
    <tr>
      <th>Indicador</th>
      {Array.isArray(mediciones) && mediciones.map((medicion, index) => (
        <th key={`header-${index}`}>Medición {index + 1}</th> 
      ))}
      {(!Array.isArray(mediciones) || mediciones.length === 0) && (
        <th>Sin datos</th>
      )}
    </tr>
    {/* Fila de acciones */}
    {Array.isArray(mediciones) && mediciones.length > 0 && (
      <tr>
        <th style={{backgroundColor: '#f8f9fa', fontWeight: 'bold'}}>Acciones</th>
        {mediciones.map((medicion, index) => (
          <th key={`actions-${index}`} style={{backgroundColor: '#f8f9fa', padding: '10px', textAlign: 'center'}}>
            {editandoMedicion === medicion.id_medicion ? (
              <div style={{display: 'flex', gap: '5px', justifyContent: 'center'}}>
                <Button color="success" size="sm" onClick={handleGuardarEdicion}>
                  Guardar
                </Button>
                <Button color="secondary" size="sm" onClick={handleCancelarEdicion}>
                  Cancelar
                </Button>
              </div>
            ) : (
              <div style={{display: 'flex', gap: '10px', justifyContent: 'center'}}>
                <FaEdit 
                  style={{color: '#007bff', cursor: 'pointer', fontSize: '18px'}}
                  title="Editar medición"
                  onClick={() => handleEditarMedicion(medicion)}
                />
                <FaTrash 
                  style={{color: '#dc3545', cursor: 'pointer', fontSize: '18px'}}
                  title="Eliminar medición"
                  onClick={() => handleEliminarMedicion(medicion.id_medicion)}
                />
              </div>
            )}
          </th>
        ))}
      </tr>
    )}
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
        {Array.isArray(mediciones) && mediciones.length > 0 ? (
          mediciones.map((medicion, index) => (
            <td key={`data-${index}-${clave}`}>
              {editandoMedicion === medicion.id_medicion ? (
                <Input
                  type="number"
                  value={datosEdicion[clave] || ''}
                  onChange={(e) => handleCambioEdicion(clave, e.target.value)}
                  style={{width: '100%', padding: '5px'}}
                />
              ) : (
                medicion[clave] || "N/A"
              )}
            </td> 
          ))
        ) : (
          <td>No hay datos</td>
        )}
      </tr>
    ))}
  </tbody>
</Table>
</div>
<div className="consulta-header">
  <h1 className="consulta-titulo">Grafico de Mediciones</h1>
</div>
<div className="mediciones-container"> 
{Array.isArray(resultados) && resultados.length > 0 ? (
  <ResponsiveContainer width="100%" height={400}>
    <GraficoResultadosCompuesto resultados={resultados} />
  </ResponsiveContainer>
) : (
  <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
    <p>No hay datos suficientes para mostrar el gráfico</p>
  </div>
)}
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