import { emailLayout, emailStyles, inlineStyles } from "../styles";
import { EnviarCorreoAsignacionJuzgadoParams } from "../server";

type TemplateParams = {
  nombreInfractor: string;
  folio: string;
  urlVistaCiudadano: string;
};

interface TemplateAsignacionJuzgadoParams {
  nombre_titular_liberacion: string;
  folio: string;
  numero_oficio: string;
}

export function templateInfraccion(data: TemplateParams) {
  const html = emailLayout(`
    <h1 style="${inlineStyles(emailStyles.title)}">
      Infracción Registrada
    </h1>

    <p style="${inlineStyles(emailStyles.greeting)}">
      Hola <b>${data.nombreInfractor}</b>,
    </p>

    <p style="${inlineStyles(emailStyles.body)}">
      Tu infracción fue registrada correctamente.
    </p>

    <div style="${inlineStyles(emailStyles.folioBox)}">
      <p style="margin:0;">
        <b>Folio:</b> ${data.folio}
      </p>
    </div>

    <p style="${inlineStyles(emailStyles.body)}">
      Puedes consultar el estatus de tu infracción
      escaneando el siguiente código QR:
    </p>

    <div style="${inlineStyles(emailStyles.qrContainer)}">
      <img src="cid:qr_infraccion" width="220" height="220" />
    </div>

    <p style="${inlineStyles(emailStyles.body)}">
      O ingresando directamente a:
    </p>

    <a href="${data.urlVistaCiudadano}" style="${inlineStyles(emailStyles.link)}">
      ${data.urlVistaCiudadano}
    </a>
  `);

  const text = `
    Hola ${data.nombreInfractor}

    Tu infracción fue registrada correctamente.

    Folio: ${data.folio}

    Consulta el estatus aquí:
    ${data.urlVistaCiudadano}
  `;

  return { html, text };
}

export function templateCapturaInfractor(data: TemplateParams) {
  const html = emailLayout(`
    <h1 style="${inlineStyles(emailStyles.title)}">
      Documentación Requerida
    </h1>

    <p style="${inlineStyles(emailStyles.greeting)}">
      Hola <b>${data.nombreInfractor}</b>,
    </p>

    <p style="${inlineStyles(emailStyles.body)}">
      Tus datos han sido registrados correctamente. Tu vehículo se
      encuentra en el corralón y necesitas subir la documentación
      requerida para continuar con el proceso de liberación.
    </p>

    <div style="${inlineStyles(emailStyles.folioBox)}">
      <p style="margin:0;">
        <b>Folio:</b> ${data.folio}
      </p>
    </div>

    <p style="${inlineStyles(emailStyles.body)}">
      Ingresa al siguiente enlace para subir tus documentos:
    </p>

    <div style="${inlineStyles(emailStyles.qrContainer)}">
      <img src="cid:qr_infraccion" width="220" height="220" />
    </div>

    <a href="${data.urlVistaCiudadano}" style="${inlineStyles(emailStyles.link)}; display:block; text-align:center; margin-top:16px;">
      ${data.urlVistaCiudadano}
    </a>
  `);

  const text = `
    Hola ${data.nombreInfractor}

    Tus datos han sido registrados correctamente. Tu vehículo se
    encuentra en el corralón y necesitas subir la documentación
    requerida para continuar con el proceso de liberación.

    Folio: ${data.folio}

    Ingresa al siguiente enlace para subir tus documentos:
    ${data.urlVistaCiudadano}
  `;

  return { html, text };
}

export function templateAsignacionJuzgado(
  data: EnviarCorreoAsignacionJuzgadoParams,
) {
  const baseUrl =
    process.env.NODE_ENV === "production"
      ? "https://via-v2.vercel.app"
      : "http://localhost:3000";

  const urlVistaCiudadano = `${baseUrl}/infracciones/${data.numero_oficio}`;

  const html = emailLayout(`
    <p style="${inlineStyles(emailStyles.greeting)}">
      Estimado(a) <strong>${data.nombreTitular}</strong>,
    </p>

    <p style="${inlineStyles(emailStyles.body)}">
      Por este medio se comunica a usted que su expediente ha sido registrado y asignado al <strong>Juzgado Cívico</strong> de esta dependencia, conforme a los procedimientos administrativos establecidos en la ley.
    </p>

    <div style="${inlineStyles(emailStyles.folioBox)}">
      <p style="margin:0 0 8px 0;"><b>Número de Folio:</b> ${data.folio}</p>
      <p style="margin:0 0 8px 0;"><b>Número de Oficio:</b> ${data.numero_oficio}</p>
      <p style="margin:0;"><b>Estado del Expediente:</b> ASIGNADO A JUZGADO CÍVICO</p>
    </div>

    <hr style="${inlineStyles(emailStyles.divider)}" />

    <h2 style="${inlineStyles(emailStyles.title)}">Requisitos a Cumplir</h2>

    <p style="${inlineStyles(emailStyles.body)}">
      Conforme a lo establecido en los procedimientos administrativos vigentes, se le requiere cargar la documentación solicitada dentro del plazo legal establecido. El incumplimiento de esta obligación puede resultar en la aplicación de sanciones administrativas según corresponda a derecho.
    </p>

    <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 25px 0; font-size: 14px; line-height: 1.6; color: #78350f; font-weight: 500;">
      <strong>⚠ ATENCIÓN:</strong> Es obligatorio subir toda la documentación requerida dentro del plazo establecido. La no presentación de documentos puede afectar la resolución de su expediente.
    </div>

    <div style="text-align:center; margin: 35px 0 20px 0;">
      <a href="${urlVistaCiudadano}" style="${inlineStyles(emailStyles.primaryButton)}">
        INGRESAR AL SISTEMA
      </a>
    </div>

    <p style="${inlineStyles(emailStyles.body)}; text-align:center; font-size:12px;">
      Si no puede acceder mediante el botón anterior, copie el siguiente enlace en su navegador:
    </p>

    <div style="background: #f5f5f5; padding: 12px; border-radius: 4px; word-break: break-all; font-size: 11px; border: 1px solid #d0d0d0; text-align:center;">
      <a href="${urlVistaCiudadano}" style="color: #2563eb; text-decoration:none;">
        ${urlVistaCiudadano}
      </a>
    </div>
  `);

  const text = `
SECRETARÍA DE SEGURIDAD PÚBLICA MUNICIPAL
OFICINA DE PROCESOS ADMINISTRATIVOS

Estimado(a) ${data.nombreTitular},

Por este medio se comunica a usted que su expediente ha sido registrado y asignado al Juzgado Cívico de esta dependencia, conforme a los procedimientos administrativos establecidos en la ley.

DATOS DEL EXPEDIENTE:
─────────────────────────────────────────
Folio:                ${data.folio}
Número de Oficio:     ${data.numero_oficio}
Estado:               ASIGNADO A JUZGADO CÍVICO

REQUISITOS A CUMPLIR:

Conforme a lo establecido en los procesos administrativos, se le requiere cargar la documentación solicitada dentro del plazo legal establecido. El incumplimiento de esta obligación puede resultar en la aplicación de sanciones según corresponda.

Para acceder al portal de documentación:
${urlVistaCiudadano}

Atentamente,

Secretaría de Seguridad Pública Municipal
Juzgado Cívico
`;

  return { html, text };
}

export function templateAsignacionFiscalia(
  data: EnviarCorreoAsignacionJuzgadoParams & { urlVistaCiudadano?: string },
) {
  const baseUrl =
    process.env.NODE_ENV === "production"
      ? "https://via-v2.vercel.app"
      : "http://localhost:3000";

  const urlVistaCiudadano = data.urlVistaCiudadano || `${baseUrl}/infracciones/${data.idInfraccion}`;

  const html = emailLayout(`
    <p style="${inlineStyles(emailStyles.greeting)}">
      Estimado(a) <strong>${data.nombreTitular}</strong>,
    </p>

    <p style="${inlineStyles(emailStyles.body)}">
      Por este medio se le notifica que su expediente ha sido registrado en <strong>Fiscalía de SJR</strong>. A partir de este momento, puede subir la documentación requerida para continuar con el proceso de liberación de su vehículo.
    </p>

    <div style="${inlineStyles(emailStyles.folioBox)}">
      <p style="margin:0 0 8px 0;"><b>Número de Folio:</b> ${data.folio}</p>
      <p style="margin:0 0 8px 0;"><b>Número de Oficio:</b> ${data.numero_oficio}</p>
      <p style="margin:0;"><b>Estado del Expediente:</b> PENDIENTE DE DOCUMENTACIÓN</p>
    </div>

    <hr style="${inlineStyles(emailStyles.divider)}" />

    <h2 style="${inlineStyles(emailStyles.title)}">Documentación Requerida</h2>

    <p style="${inlineStyles(emailStyles.body)}">
      Para continuar con el proceso de liberación, es necesario que cargue la siguiente documentación a través del portal ciudadano:
    </p>

    <ul style="font-size:14px; line-height:2; color:#0f172a; padding-left:20px;">
      <li>Factura original del vehículo</li>
      <li>INE del titular (vigente)</li>
      <li>Comprobante de domicilio (reciente)</li>
      <li>Tarjeta de circulación</li>
      <li>Poder notarial (si aplica)</li>
    </ul>

    <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 25px 0; font-size: 14px; line-height: 1.6; color: #78350f; font-weight: 500;">
      <strong>⚠ ATENCIÓN:</strong> Es obligatorio subir toda la documentación requerida dentro del plazo establecido. La no presentación de documentos puede retrasar el proceso de liberación.
    </div>

    <div style="${inlineStyles(emailStyles.qrContainer)}">
      <img src="cid:qr_infraccion" alt="Código QR" width="180" />
    </div>

    <div style="text-align:center; margin: 20px 0;">
      <a href="${urlVistaCiudadano}" style="${inlineStyles(emailStyles.primaryButton)}">
        SUBIR DOCUMENTACIÓN
      </a>
    </div>

    <p style="${inlineStyles(emailStyles.body)}; text-align:center; font-size:12px;">
      Si no puede acceder mediante el botón anterior, copie el siguiente enlace en su navegador:
    </p>

    <div style="background: #f5f5f5; padding: 12px; border-radius: 4px; word-break: break-all; font-size: 11px; border: 1px solid #d0d0d0; text-align:center;">
      <a href="${urlVistaCiudadano}" style="color: #2563eb; text-decoration:none;">
        ${urlVistaCiudadano}
      </a>
    </div>
  `);

  const text = `
SECRETARÍA DE SEGURIDAD PÚBLICA MUNICIPAL
FISCALÍA DE SJR

Estimado(a) ${data.nombreTitular},

Por este medio se le notifica que su expediente ha sido registrado en Fiscalía de SJR. A partir de este momento, puede subir la documentación requerida para continuar con el proceso de liberación.

DATOS DEL EXPEDIENTE:
─────────────────────────────────────────
Folio:                ${data.folio}
Número de Oficio:     ${data.numero_oficio}
Estado:               PENDIENTE DE DOCUMENTACIÓN

DOCUMENTACIÓN REQUERIDA:
─────────────────────────────────────────
- Factura original del vehículo
- INE del titular (vigente)
- Comprobante de domicilio (reciente)
- Tarjeta de circulación
- Poder notarial (si aplica)

Para acceder al portal de documentación y subir sus archivos, escanee el código QR incluido en este correo o ingrese al siguiente enlace:
${urlVistaCiudadano}

Atentamente,

Secretaría de Seguridad Pública Municipal
Fiscalía de SJR
`;

  return { html, text };
}

type TemplateLiberacionParams = {
  nombreInfractor: string;
  folio: string;
  urlVistaCiudadano: string;
};

export function templateLiberacion(data: TemplateLiberacionParams) {
  const html = emailLayout(`
    <h1 style="${inlineStyles(emailStyles.title)}">
      Orden de Liberación Emitida
    </h1>

    <p style="${inlineStyles(emailStyles.greeting)}">
      Estimado(a) <strong>${data.nombreInfractor}</strong>,
    </p>

    <p style="${inlineStyles(emailStyles.body)}">
      Le informamos que la revisión de la documentación correspondiente
      a la infracción con folio <strong>${data.folio}</strong>
      ha sido concluida satisfactoriamente.
    </p>

    <p style="${inlineStyles(emailStyles.body)}">
      Su vehículo ha sido autorizado para liberación y la
      <strong>Orden de Salida</strong> se encuentra adjunta a este correo
      en formato PDF.
    </p>

    <p style="${inlineStyles(emailStyles.body)}">
      Le recomendamos conservar este documento y presentarlo
      cuando sea requerido durante el proceso de entrega del vehículo.
    </p>

    <div style="${inlineStyles(emailStyles.qrContainer)}">
      <img src="cid:qr_infraccion" alt="QR" width="180" />
    </div>

    <p style="${inlineStyles(emailStyles.body)}">
      También puede consultar el seguimiento de su trámite en:
    </p>

    <a href="${data.urlVistaCiudadano}" style="${inlineStyles(emailStyles.link)}">
      ${data.urlVistaCiudadano}
    </a>
  `);

  const text = `
Orden de Liberación Emitida

Estimado(a) ${data.nombreInfractor},

La revisión de su documentación ha sido aprobada.

Folio: ${data.folio}

Su vehículo ha sido autorizado para liberación.

La Orden de Salida se encuentra adjunta a este correo en formato PDF.

Puede consultar el seguimiento de su trámite en:
${data.urlVistaCiudadano}
`;

  return { html, text };
}
