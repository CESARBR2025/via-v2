import { POOL_PG } from "@/lib/db";
import { getExpedienteToken } from "@/lib/expediente-digital/expediente";

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

function validarArchivo(file: File | null, nombre: string) {
  if (!file) return;
  const esValido =
    file.type.startsWith("image/") || file.type === "application/pdf";
  if (!esValido) {
    throw new Error(`Tipo de archivo no permitido: ${nombre}`);
  }
}

const TIPOS_LIBERACION = ["INFRACCION", "DELITO", "ACCIDENTE"] as const;
type TipoLiberacion = (typeof TIPOS_LIBERACION)[number];

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
  ],
  ACCIDENTE: [
    { campo: "factura", formKey: "archivoFactura", label: "Factura" },
    { campo: "ine_titular", formKey: "archivoIneTitular", label: "INE del titular" },
  ],
};

const EMPRESA_FILES: ArchivoConfig[] = [
  { campo: "ine_representante_legal", formKey: "archivoIneRepresentanteLegal", label: "INE del representante legal" },
  { campo: "poder_notarial", formKey: "archivoPoderNotarial", label: "Poder notarial" },
  { campo: "constancia_situacion_fiscal", formKey: "archivoConstanciaSituacionFiscal", label: "Constancia de situación fiscal" },
];

export type StatusUpdate = {
  estatus?: string;
  estatus_dependencia: string;
};

export async function procesarSubidaDocumentos(
  formData: FormData,
  statusUpdate: StatusUpdate,
) {
  const idInfraccion = formData.get("idInfraccion") as string | null;
  const tipoLiberacion = formData.get("tipoLiberacion") as string | null;
  const esEmpresa = formData.get("esEmpresa") === "true";

  if (!idInfraccion) {
    throw new Error("idInfraccion es requerido");
  }

  if (!tipoLiberacion || !TIPOS_LIBERACION.includes(tipoLiberacion as any)) {
    throw new Error(`tipoLiberacion debe ser uno de: ${TIPOS_LIBERACION.join(", ")}`);
  }

  const tipo = tipoLiberacion as TipoLiberacion;

  let nombreEmpresa: string | null = null;
  let rfcEmpresa: string | null = null;
  let nombreRespFiscal: string | null = null;
  let apPaternoRespFiscal: string | null = null;
  let apMaternoRespFiscal: string | null = null;

  if (esEmpresa) {
    nombreEmpresa = (formData.get("nombreEmpresa") as string) || null;
    rfcEmpresa = (formData.get("rfcEmpresa") as string) || null;
    nombreRespFiscal = (formData.get("nombreRespFiscal") as string) || null;
    apPaternoRespFiscal = (formData.get("apPaternoRespFiscal") as string) || null;
    apMaternoRespFiscal = (formData.get("apMaternoRespFiscal") as string) || null;
  }

  const archivos: (ArchivoConfig & { file: File | null })[] = [];

  const tipoFiles = REQUIRED_FILES[tipo];
  for (const f of tipoFiles) {
    const file = formData.get(f.formKey) as File | null;
    archivos.push({ ...f, file });
  }

  if (esEmpresa) {
    for (const f of EMPRESA_FILES) {
      const file = formData.get(f.formKey) as File | null;
      archivos.push({ ...f, file });
    }
  }

  const tieneDocumentos = archivos.some((a) => a.file !== null);
  if (!tieneDocumentos) {
    throw new Error("No se enviaron documentos");
  }

  for (const a of archivos) {
    validarArchivo(a.file, a.label);
  }

  const token = await getExpedienteToken();

  const docsSubidos: { campo: string; url: string; label: string }[] = [];

  for (const a of archivos) {
    if (a.file) {
      const url = await subirArchivo(a.file, a.campo, idInfraccion, token);
      docsSubidos.push({ campo: a.campo, url, label: a.label });
    }
  }

  const client = await POOL_PG.connect();

  try {
    await client.query("BEGIN");

    let solicitudId: string;

    const existente = await client.query(
      `SELECT id FROM v2_solicitudes_liberacion WHERE infraccion_id = $1`,
      [idInfraccion],
    );

    if (existente.rows.length > 0) {
      solicitudId = existente.rows[0].id;

      await client.query(
        `UPDATE v2_solicitudes_liberacion
         SET tipo_liberacion = $2, es_empresa = $3,
             nombre_empresa = COALESCE($4, nombre_empresa),
             rfc_empresa = COALESCE($5, rfc_empresa),
             nombre_resp_fiscal = COALESCE($6, nombre_resp_fiscal),
             appaterno_resp_fiscal = COALESCE($7, appaterno_resp_fiscal),
             apmaterno_resp_fiscal = COALESCE($8, apmaterno_resp_fiscal),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [solicitudId, tipo, esEmpresa, nombreEmpresa, rfcEmpresa, nombreRespFiscal, apPaternoRespFiscal, apMaternoRespFiscal],
      );
    } else {
      const r = await client.query(
        `INSERT INTO v2_solicitudes_liberacion (infraccion_id, tipo_liberacion, es_empresa, nombre_empresa, rfc_empresa, estatus, nombre_resp_fiscal, appaterno_resp_fiscal, apmaterno_resp_fiscal)
         VALUES ($1, $2, $3, $4, $5, 'PENDIENTE', $6, $7, $8)
         RETURNING id`,
        [idInfraccion, tipo, esEmpresa, nombreEmpresa, rfcEmpresa, nombreRespFiscal, apPaternoRespFiscal, apMaternoRespFiscal],
      );
      solicitudId = r.rows[0].id;
    }

    for (const doc of docsSubidos) {
      await client.query(
        `INSERT INTO v2_documentos_liberacion (solicitud_id, tipo_documento, url_documento)
         VALUES ($1, $2, $3)`,
        [solicitudId, doc.campo, doc.url],
      );
    }

    const setClauses: string[] = ['updated_at = CURRENT_TIMESTAMP'];
    const values: any[] = [idInfraccion];
    let idx = 2;

    if (statusUpdate.estatus) {
      setClauses.push(`estatus = $${idx++}`);
      values.push(statusUpdate.estatus);
    }
    if (statusUpdate.estatus_dependencia) {
      setClauses.push(`estatus_dependencia = $${idx++}`);
      values.push(statusUpdate.estatus_dependencia);
    }

    await client.query(
      `UPDATE v2_infracciones SET ${setClauses.join(', ')} WHERE id = $1`,
      values,
    );

    await client.query("COMMIT");

    return {
      idInfraccion,
      solicitudId,
      tipoLiberacion: tipo,
      esEmpresa,
      documentos: docsSubidos.map((d) => ({ tipo: d.campo, url: d.url })),
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
