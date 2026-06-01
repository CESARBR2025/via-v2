import { DatosInfraccion } from "./types.";

export const datosIniciales: DatosInfraccion = {
  //Archivo de datos
  archivoINE: null,
  archivoInapam: null,
  archivoTarjetaCirculacion: null,

  // Datos de formulario
  esCiudadanoAdultoMayor: false,
  presentaInapam: false,
  fechaLimiteDescuento: "",
  descuentoAplicado: 0,

  //======== FASE 1 ========
  estaCiudadanoPresente: true,
  esCiudadanoTitular: null,

  //======== FASE 2 ========
  latitud: null,
  longitud: null,

  calle: "",
  numero: "",
  colonia: "",
  codigoPostal: "",
  municipio: "",
  estado: "",

  //======== FASE 3 ========
  presentaIne: null,

  correoInfractor: "",
  curpInfractor: "",

  nombreInfractor: "",
  apMaternoInfractor: "",
  apPaternoInfractor: "",

  //======== FASE 4 ========
  marca: "",
  modelo: "",
  anio: "",
  color: "",
  placa: "",
  noSerie: "",
  estadoOrigen: "",

  tipoVehiculo: "",

  servicio: "",
  otroServicio: "",

  //======== FASE 5 ========
  articuloId: "",
  articuloDescripcion: "",
  articuloNumero: "",

  fraccionId: "",
  fraccionDescripcion: "",
  fraccionNumero: "",
  fraccionMonto: "",
  fraccionClasificacion: "",

  garantiaSeleccionada: "",

  motivoRetencionVehiculo: "",

  gruaInvolucrada: "",

  //======== FASE 6 ========
  agregarEvidencia: false,
};
