import jsPDF from "jspdf";

/** Carga una imagen desde una URL pública y devuelve su base64 */
import fs from "fs/promises";
import path from "path";

export async function loadImageAsBase64(publicPath: string): Promise<string> {
  const normalizedPath = publicPath.replace(/^\/+/, "");

  const imagePath = path.join(process.cwd(), "public", normalizedPath);

  const buffer = await fs.readFile(imagePath);

  const extension = path.extname(imagePath).toLowerCase();

  const mimeType =
    extension === ".png"
      ? "image/png"
      : extension === ".jpg" || extension === ".jpeg"
        ? "image/jpeg"
        : "application/octet-stream";

  return `data:${mimeType};base64,${buffer.toString("base64")}`;
}
/** Formatea la fecha al estilo del documento: "17 FEBRERO DEL 2026" */
function formatearFecha(date = new Date()): string {
  const meses = [
    "ENERO",
    "FEBRERO",
    "MARZO",
    "ABRIL",
    "MAYO",
    "JUNIO",
    "JULIO",
    "AGOSTO",
    "SEPTIEMBRE",
    "OCTUBRE",
    "NOVIEMBRE",
    "DICIEMBRE",
  ];
  const d = date.getDate().toString().padStart(2, "0");
  const m = meses[date.getMonth()];
  const a = date.getFullYear();
  return `${d} ${m} DEL ${a}`;
}

/** Genera el número de oficio formateado: SSPM/DHT/0199/2026 */
function formatearOficio(noOficio: string | undefined, anio: number): string {
  const num = noOficio ?? "0000";
  return `SSPM/DHT/${num}/${anio}`;
}

async function drawWatermark(doc: jsPDF, base64: string): Promise<void> {
  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();

  // bajar opacidad
  doc.setGState(new (doc as any).GState({ opacity: 0.2 }));

  doc.addImage(base64, "PNG", 0, 0, pw, ph, undefined, "FAST");

  // restaurar opacidad
  doc.setGState(new (doc as any).GState({ opacity: 1 }));
}

function parrafoMixtoConWrap(
  doc: jsPDF,
  segmentos: Array<{ text: string; bold: boolean }>,
  x: number,
  y: number,
  maxWidth: number,
  fontSize: number,
  lineHeight: number,
): number {
  // Tokenizamos todo en palabras manteniendo a qué segmento pertenecen
  type Token = { word: string; bold: boolean };
  const tokens: Token[] = [];
  for (const seg of segmentos) {
    const words = seg.text.split(" ");
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      if (word === "") continue;
      // Si no es la última palabra del segmento, añade espacio
      const needsTrailing = i < words.length - 1 || seg.text.endsWith(" ");
      tokens.push({ word: needsTrailing ? word + " " : word, bold: seg.bold });
    }
  }

  let currentX = x;
  let currentY = y;

  for (let i = 0; i < tokens.length; i++) {
    const { word, bold } = tokens[i];
    const font = bold ? "helvetica" : "helvetica";
    const style = bold ? "bold" : "normal";
    doc.setFont(font, style);
    doc.setFontSize(fontSize);
    const wordW = doc.getTextWidth(word);

    // ¿Cabe en la línea actual?
    if (currentX + wordW > x + maxWidth && currentX > x) {
      // Salto de línea
      currentX = x;
      currentY += lineHeight;
    }

    doc.text(word, currentX, currentY);
    currentX += wordW;
  }

  return currentY + lineHeight;
}

export async function generarOrdenSalidaVehiculo({ data }: any) {
  console.log(data);
  const no_externo = data.noExterno ?? " ";

  const motivo = data.motivoRetencion;
  const estadoOrigen = data.estadoOrigen;
  const noSerie = data.noSerie;

  const anio = new Date().getFullYear();
  const fecha = formatearFecha();
  const ciudad = "SAN JUAN DEL RIO, QRO";
  const oficio = formatearOficio(data.noOficio ?? "0000", anio);

  const marca = (data.marca ?? "—").toUpperCase();
  const tipo = (data.tipoVehiculo ?? "—").toUpperCase();
  const modelo = (data.modelo ?? "—").toUpperCase();
  const color = (data.color ?? "—").toUpperCase();
  const placa = (data.placa ?? "—").toUpperCase();

  const director = "CMTE. FRANCISCO JAVIER VERTIZ VELAZQUEZ".toUpperCase();
  const nombreRecibe = `C. ${data.nombreTitular}`.toUpperCase();
  console.log(nombreRecibe);

  const empresaFiscal = data.rfc ? data.empresaFiscal : "Titular";

  console.log(empresaFiscal);

  const grua = (
    data.garantiaRetenida === "VEHICULO" ? data.grua! : "Sin Grua"
  ).toUpperCase();

  // ── US Letter: 215.9 × 279.4 mm ──
  const doc = new jsPDF({ unit: "mm", format: "letter" });
  const pw = doc.internal.pageSize.getWidth(); // 215.9 mm

  // Márgenes exactos del Word (DXA → mm: DXA / 1440 * 25.4)
  const mgL = 30.0; // 1701 DXA → 30.0 mm
  const mgR = 25.9; // 1467 DXA → 25.9 mm
  const anchoUtil = pw - mgL - mgR; // ~160 mm

  // Tamaños de fuente
  const FS = 12; // body: 12pt = 24 half-points del Word
  const FS_SMALL = 10; // nombres y pie: ≈ size 18-20 del Word
  const LH = 6.35; // line height single-spacing 12pt

  // ─────────────────────────────────────────────
  // 1. FONDO BLANCO
  // ─────────────────────────────────────────────
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pw, doc.internal.pageSize.getHeight(), "F");

  // ─────────────────────────────────────────────
  // 2. MARCA DE AGUA — PRIMERO, debajo de todo
  // ─────────────────────────────────────────────
  try {
    const wmBase64 = await loadImageAsBase64("/marca_agua/header.png");
    await drawWatermark(doc, wmBase64);
  } catch {
    console.warn("Marca de agua no disponible.");
  }

  // ─────────────────────────────────────────────
  // 3. CONTENIDO
  //    Posiciones Y medidas pixel a pixel del Word
  //    renderizado a 200dpi (1700×2200px = 215.9×279.4mm)
  // ─────────────────────────────────────────────

  /** Label en bold + valor en normal en la misma línea */
  const lineaMixta = (label: string, valor: string, y: number): void => {
    doc.setFontSize(FS);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.text(label, mgL, y);
    const lw = doc.getTextWidth(label);
    doc.setFont("helvetica", "normal");
    doc.text(valor, mgL + lw, y);
  };

  /** Línea completa en bold */
  const lineaBold = (texto: string, y: number, x = mgL): void => {
    doc.setFontSize(FS);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text(texto, x, y);
  };

  // ── ENCABEZADO ──
  lineaMixta("SECCIÓN", ": DIRECCION DE TRANSITO MUNICIPAL", 43.2);
  lineaMixta("DEPARTAMENTO: ", "DE HECHOS DE TRÁNSITO", 49.8);
  lineaMixta("No. OFICIO", `: ${oficio}.`, 55.9);
  lineaMixta("ASUNTO", ": SALIDA DE VEHICULO", 62.5);

  // ── FECHA — alineada a la derecha ──
  doc.setFontSize(FS);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0);
  doc.text(`${ciudad}, ${fecha}.`, pw - mgR, 72.4, { align: "right" });

  // ── DESTINATARIO ──
  lineaBold("C. ENCARGADO DE GRÚAS", 82.5);
  lineaBold("P R E S E N T E", 100.3);

  // ── TÍTULO CENTRAL ──
  // Centrado en la mitad derecha del ancho útil (igual que el Word)
  doc.setFontSize(FS);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("ORDEN DE SALIDA DE VEHICULO", mgL + anchoUtil / 2, 108.6, {
    align: "center",
  });

  // ── DATOS DEL VEHÍCULO ──
  // Espaciado doble entre campos (≈ 12.7 mm = 2 × LH single-spacing)
  lineaBold(`MARCA: ${marca}`, 119.4);
  lineaBold(`TIPO ${tipo}`, 132.1);
  lineaBold(`MODELO: ${modelo}`, 144.8);
  lineaBold(`COLOR: ${color}`, 157.5);
  lineaBold(
    `PLACA: ${placa} PARA EL ESTADO DE ${estadoOrigen!.toUpperCase()}`,
    170.2,
  );
  lineaBold(`NUMERO DE SERIE: ${noSerie}`, 182.9);

  // ── PÁRRAFO NARRATIVO — con word-wrap y negritas selectivas ──
  // En el Word ocupa 2 líneas. Usamos parrafoMixtoConWrap para replicarlo.
  doc.setTextColor(0, 0, 0);
  parrafoMixtoConWrap(
    doc,
    [
      { text: "EL VEHÍCULO REMITIDO Y DEPOSITADO POR ", bold: false },
      { text: `${motivo} ${no_externo} `, bold: true },
      { text: "LOCAL DE ENCIERRO GRUAS ", bold: false },
      { text: `${grua}`, bold: true },
    ],
    20,
    195.6,
    180,
    FS,
    LH,
  );

  // ── RECIBE / ENTREGA ──
  // RECIBE: ~22% del ancho útil (medido del Word)
  // ENTREGA: ~77% del ancho útil
  doc.setFontSize(FS_SMALL);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0);
  doc.text("RECIBE", mgL + anchoUtil * 0.22, 210.8, { align: "center" });
  doc.text("ENTREGA", mgL + anchoUtil * 0.77, 210.8, { align: "center" });

  // ── NOMBRES ──
  doc.setFontSize(FS_SMALL);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0);

  // RECIBE: empresa arriba, responsable abajo
  const recibeX = mgL + anchoUtil * 0.22;
  doc.text(nombreRecibe, recibeX, 226.1, { align: "center" });
  doc.text(empresaFiscal, recibeX, 232.4, { align: "center" });

  // ENTREGA: director y su cargo
  doc.text(director, mgL + anchoUtil * 0.52, 226.1);

  // ── CARGO DEL DIRECTOR — centrado bajo su nombre ──
  const directorX = mgL + anchoUtil * 0.52;
  const directorW = doc.getTextWidth(director);
  const cargoText = "DIRECTOR DE TRANSITO MUNICIPAL";
  doc.setFontSize(FS_SMALL);
  doc.text(cargoText, directorX + directorW / 2, 232.4, { align: "center" });

  const pdfArrayBuffer = doc.output("arraybuffer");

  return Buffer.from(pdfArrayBuffer);
}
