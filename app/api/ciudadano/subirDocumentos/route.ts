import { NextRequest, NextResponse } from "next/server";
import { POOL_PG } from "@/lib/db";
import { getExpedienteToken } from "@/lib/expediente-digital/expediente";

// =====================================================
// SUBIR ARCHIVO A EXPEDIENTE DIGITAL
// =====================================================

async function subirArchivo(
  archivo: File,
  carpeta: string,
  idInfraccion: string,
  token: string,
): Promise<string> {
  const now = new Date();
  const anio = now.getFullYear().toString();
  const mes = String(now.getMonth() + 1).padStart(2, "0");

  const form = new FormData();
  form.append("file", archivo);
  form.append("ruta_personalizada", `${anio}/${mes}/${idInfraccion}`);
  form.append("sistema", process.env.EXPEDIENTE_SISTEMA ?? "sspm");

  const response = await fetch(
    `${process.env.EXPEDIENTE_HOST}/api/upload-custom`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: form,
    },
  );

  if (!response.ok) {
    const error = await response.json();
    console.error(`[EXPEDIENTE DIGITAL] Error subiendo ${carpeta}:`, error);
    throw new Error(`Error al subir ${carpeta}`);
  }

  const { data } = await response.json();
  return data.ruta_relativa;
}

// =====================================================
// VALIDAR ARCHIVO
// =====================================================

function validarArchivo(file: File | null, nombre: string) {
  if (!file) return;

  const esValido =
    file.type.startsWith("image/") || file.type === "application/pdf";

  if (!esValido) {
    throw new Error(`Tipo de archivo no permitido: ${nombre}`);
  }
}

// =====================================================
// TIPOS VÁLIDOS
// =====================================================

const TIPOS_LIBERACION = ["INFRACCION", "DELITO", "ACCIDENTE"] as const;

type TipoLiberacion = (typeof TIPOS_LIBERACION)[number];

// =====================================================
// ARCHIVOS REQUERIDOS POR TIPO
// =====================================================

type ArchivoConfig = {
  campo: string;
  formKey: string;
  label: string;
};

const REQUIRED_FILES: Record<TipoLiberacion, ArchivoConfig[]> = {
  INFRACCION: [
    { campo: "factura", formKey: "archivoFactura", label: "Factura" },
    { campo: "ine_titular", formKey: "archivoIneTitular", label: "INE del titular" },
    { campo: "comprobante_domicilio", formKey: "archivoComprobanteDomicilio", label: "Comprobante de domicilio" },
    { campo: "tarjeta_circulacion", formKey: "archivoTarjetaCirculacion", label: "Tarjeta de circulación" },
  ],
  DELITO: [
    { campo: "factura", formKey: "archivoFactura", label: "Factura" },
    { campo: "ine_titular", formKey: "archivoIneTitular", label: "INE del titular" },
    { campo: "oficio_liberacion_fiscalia", formKey: "archivoOficioLiberacionFiscalia", label: "Oficio de liberación fiscalía" },
  ],
  ACCIDENTE: [
    { campo: "factura", formKey: "archivoFactura", label: "Factura" },
    { campo: "ine_titular", formKey: "archivoIneTitular", label: "INE del titular" },
    { campo: "oficio_liberacion_juzgado", formKey: "archivoOficioLiberacionJuzgado", label: "Oficio de liberación juzgado cívico" },
  ],
};

const EMPRESA_FILES: ArchivoConfig[] = [
  { campo: "ine_representante_legal", formKey: "archivoIneRepresentanteLegal", label: "INE del representante legal" },
  { campo: "poder_notarial", formKey: "archivoPoderNotarial", label: "Poder notarial" },
  { campo: "constancia_situacion_fiscal", formKey: "archivoConstanciaSituacionFiscal", label: "Constancia de situación fiscal" },
];

// =====================================================
// POST
// =====================================================

export async function POST(req: NextRequest) {
  const client = await POOL_PG.connect();

  try {
    const formData = await req.formData();

    // =====================================================
    // VALIDAR CAMPOS BASE
    // =====================================================

    const idInfraccion = formData.get("idInfraccion") as string | null;
    const tipoLiberacion = formData.get("tipoLiberacion") as string | null;
    const esEmpresa = formData.get("esEmpresa") === "true";

    if (!idInfraccion) {
      return NextResponse.json(
        { message: "idInfraccion es requerido" },
        { status: 400 },
      );
    }

    if (!tipoLiberacion || !TIPOS_LIBERACION.includes(tipoLiberacion as any)) {
      return NextResponse.json(
        {
          message: `tipoLiberacion debe ser uno de: ${TIPOS_LIBERACION.join(", ")}`,
        },
        { status: 400 },
      );
    }

    const tipo = tipoLiberacion as TipoLiberacion;

    // =====================================================
    // DATOS EMPRESA
    // =====================================================

    let nombreEmpresa: string | null = null;
    let rfcEmpresa: string | null = null;

    if (esEmpresa) {
      nombreEmpresa = (formData.get("nombreEmpresa") as string) || null;
      rfcEmpresa = (formData.get("rfcEmpresa") as string) || null;
    }

    // =====================================================
    // COLECTAR ARCHIVOS
    // =====================================================

    const archivos: (ArchivoConfig & { file: File | null })[] = [];

    // Archivos comunes del tipo
    const tipoFiles = REQUIRED_FILES[tipo];
    for (const f of tipoFiles) {
      const file = formData.get(f.formKey) as File | null;
      archivos.push({ ...f, file });
    }

    // Archivos adicionales si es empresa
    if (esEmpresa) {
      for (const f of EMPRESA_FILES) {
        const file = formData.get(f.formKey) as File | null;
        archivos.push({ ...f, file });
      }
    }

    // =====================================================
    // VALIDAR QUE HAYA AL MENOS UN DOCUMENTO
    // =====================================================

    const tieneDocumentos = archivos.some((a) => a.file !== null);

    if (!tieneDocumentos) {
      return NextResponse.json(
        { message: "No se enviaron documentos" },
        { status: 400 },
      );
    }

    // =====================================================
    // VALIDAR ARCHIVOS
    // =====================================================

    for (const a of archivos) {
      validarArchivo(a.file, a.label);
    }

    // =====================================================
    // SUBIR A EXPEDIENTE DIGITAL
    // =====================================================

    const token = await getExpedienteToken();

    const docsSubidos: { campo: string; url: string; label: string }[] = [];

    for (const a of archivos) {
      if (a.file) {
        const url = await subirArchivo(a.file, a.campo, idInfraccion, token);
        docsSubidos.push({ campo: a.campo, url, label: a.label });
      }
    }

    // =====================================================
    // PERSISTIR EN BD
    // =====================================================

    await client.query("BEGIN");

    // Insertar o reutilizar solicitud de liberación
    let solicitudId: string;

    const existente = await client.query(
      `SELECT id FROM v2_solicitudes_liberacion WHERE infraccion_id = $1`,
      [idInfraccion],
    );

    if (existente.rows.length > 0) {
      solicitudId = existente.rows[0].id;

      await client.query(
        `
        UPDATE v2_solicitudes_liberacion
        SET
          tipo_liberacion = $2,
          es_empresa = $3,
          nombre_empresa = COALESCE($4, nombre_empresa),
          rfc_empresa = COALESCE($5, rfc_empresa),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        `,
        [solicitudId, tipo, esEmpresa, nombreEmpresa, rfcEmpresa],
      );
    } else {
      const r = await client.query(
        `
        INSERT INTO v2_solicitudes_liberacion (
          infraccion_id, tipo_liberacion, es_empresa,
          nombre_empresa, rfc_empresa, estatus
        ) VALUES ($1, $2, $3, $4, $5, 'PENDIENTE')
        RETURNING id
        `,
        [idInfraccion, tipo, esEmpresa, nombreEmpresa, rfcEmpresa],
      );
      solicitudId = r.rows[0].id;
    }

    // Insertar documentos asociados a la solicitud
    for (const doc of docsSubidos) {
      await client.query(
        `
        INSERT INTO v2_documentos_liberacion (
          solicitud_id, tipo_documento, url_documento
        ) VALUES ($1, $2, $3)
        `,
        [solicitudId, doc.campo, doc.url],
      );
    }

    // Actualizar estatus de la infracción
    await client.query(
      `
      UPDATE v2_infracciones
      SET estatus_dependencia = 'ESPERA_REVISION', updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      `,
      [idInfraccion],
    );

    await client.query("COMMIT");

    return NextResponse.json(
      {
        message: "Documentos guardados correctamente",
        data: {
          idInfraccion,
          solicitudId,
          tipoLiberacion: tipo,
          esEmpresa,
          documentos: docsSubidos.map(d => ({ tipo: d.campo, url: d.url })),
        },
      },
      { status: 200 },
    );
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("[CIUDADANO][SUBIR DOCUMENTOS]", error);

    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Error interno",
      },
      { status: 500 },
    );
  } finally {
    client.release();
  }
}
