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
  console.log(data);
  const html = `
    <div style="
        font-family: Arial, sans-serif;
        background: #f5f7fb;
        padding: 40px;
    ">
        <div style="
            max-width: 620px;
            margin: auto;
            background: white;
            border-radius: 16px;
            padding: 40px;
            border: 1px solid #e5e7eb;
        ">
            <h1 style="
                color: #1e3a8a;
                margin-bottom: 10px;
            ">
                Infracción Registrada
            </h1>

            <p>
                Hola <b>${data.nombreInfractor}</b>,
            </p>

            <p>
                Tu infracción fue registrada correctamente.
            </p>

            <div style="
                background: #eff6ff;
                padding: 16px;
                border-radius: 12px;
                margin: 24px 0;
            ">
                <p style="margin:0;">
                    <b>Folio:</b> ${data.folio}
                </p>
            </div>

            <p>
                Puedes consultar el estatus de tu infracción
                escaneando el siguiente código QR:
            </p>

            <div style="
                text-align:center;
                margin: 30px 0;
            ">
                <img
    src="cid:qr_infraccion"
    width="220"
    height="220"
/>
            </div>

            <p>
                O ingresando directamente a:
            </p>

            <a
                href="${data.urlVistaCiudadano}"
                style="
                    color:#2563eb;
                    word-break: break-all;
                "
            >
                ${data.urlVistaCiudadano}
            </a>

            <hr style="
                margin: 32px 0;
                border:none;
                border-top:1px solid #e5e7eb;
            " />

            <p style="
                font-size: 12px;
                color:#6b7280;
            ">
                SSPM - Sistema de Gestión de Infracciones
            </p>
        </div>
    </div>
    `;

  const text = `
    Hola ${data.nombreInfractor}

    Tu infracción fue registrada correctamente.

    Folio: ${data.folio}

    Consulta el estatus aquí:
    ${data.urlVistaCiudadano}
    `;

  return {
    html,
    text,
  };
}

export function templateCapturaInfractor(data: TemplateParams) {
  const html = `
    <div style="
        font-family: Arial, sans-serif;
        background: #f5f7fb;
        padding: 40px;
    ">
        <div style="
            max-width: 620px;
            margin: auto;
            background: white;
            border-radius: 16px;
            padding: 40px;
            border: 1px solid #e5e7eb;
        ">
            <h1 style="
                color: #1e3a8a;
                margin-bottom: 10px;
            ">
                Documentación Requerida
            </h1>

            <p>
                Hola <b>${data.nombreInfractor}</b>,
            </p>

            <p>
                Tus datos han sido registrados correctamente. Tu vehículo se
                encuentra en el corralón y necesitas subir la documentación
                requerida para continuar con el proceso de liberación.
            </p>

            <div style="
                background: #eff6ff;
                padding: 16px;
                border-radius: 12px;
                margin: 24px 0;
            ">
                <p style="margin:0;">
                    <b>Folio:</b> ${data.folio}
                </p>
            </div>

            <p>
                Ingresa al siguiente enlace para subir tus documentos:
            </p>

            <div style="
                text-align:center;
                margin: 30px 0;
            ">
                <img
                    src="cid:qr_infraccion"
                    width="220"
                    height="220"
                />
            </div>

            <a
                href="${data.urlVistaCiudadano}"
                style="
                    color:#2563eb;
                    word-break: break-all;
                    display:block;
                    text-align:center;
                    margin-top:16px;
                "
            >
                ${data.urlVistaCiudadano}
            </a>

            <hr style="
                margin: 32px 0;
                border:none;
                border-top:1px solid #e5e7eb;
            " />

            <p style="
                font-size: 12px;
                color:#6b7280;
            ">
                SSPM - Sistema de Gestión de Infracciones
            </p>
        </div>
    </div>
  `;

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

  /**
   * URL pública del ciudadano
   */
  const urlVistaCiudadano = `${baseUrl}/infracciones/${data.numero_oficio}`;

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

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    body {
      margin: 0;
      padding: 0;
      background: #ffffff;
      font-family: 'Georgia', 'Times New Roman', serif;
      color: #1a1a1a;
      line-height: 1.6;
    }
    .container {
      max-width: 750px;
      margin: 0 auto;
      padding: 0;
    }
    .header {
      background: #2c3e50;
      color: #ffffff;
      padding: 50px 30px;
      text-align: center;
      border-bottom: 3px solid #c41e3a;
    }
    .header h1 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      letter-spacing: 1px;
      text-transform: uppercase;
      font-family: Arial, sans-serif;
    }
    .header p {
      margin: 8px 0 0 0;
      font-size: 12px;
      opacity: 0.95;
      font-family: Arial, sans-serif;
      letter-spacing: 0.5px;
    }
    .content {
      background: #ffffff;
      padding: 50px 40px;
      border-left: 5px solid #c41e3a;
    }
    .greeting {
      font-size: 14px;
      line-height: 1.8;
      margin: 0 0 30px 0;
      text-align: justify;
    }
    .section-title {
      font-size: 12px;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #2c3e50;
      margin: 30px 0 15px 0;
      border-bottom: 2px solid #e0e0e0;
      padding-bottom: 8px;
      font-family: Arial, sans-serif;
    }
    .data-row {
      display: flex;
      margin-bottom: 12px;
      font-size: 13px;
      line-height: 1.6;
    }
    .data-label {
      font-weight: bold;
      min-width: 200px;
      color: #2c3e50;
    }
    .data-value {
      color: #1a1a1a;
      font-family: 'Courier New', monospace;
      letter-spacing: 0.5px;
    }
    .divider-line {
      border: none;
      border-bottom: 1px solid #d0d0d0;
      margin: 30px 0;
    }
    .text-content {
      font-size: 13px;
      text-align: justify;
      line-height: 1.8;
      margin: 20px 0;
      color: #1a1a1a;
    }
    .highlight {
      background: #fef3c7;
      padding: 20px;
      border-left: 4px solid #f59e0b;
      margin: 25px 0;
      font-size: 13px;
      line-height: 1.8;
      color: #78350f;
      font-weight: 500;
    }
    .highlight strong {
      color: #92400e;
    }
    .cta-button {
      display: inline-block;
      background: #c41e3a;
      color: #ffffff;
      padding: 15px 50px;
      text-decoration: none;
      font-weight: bold;
      font-size: 14px;
      margin: 30px auto;
      display: block;
      text-align: center;
      font-family: Arial, sans-serif;
      letter-spacing: 0.5px;
      box-shadow: 0 3px 8px rgba(0,0,0,0.2);
      border: none;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    .cta-button:hover {
      background: #a01830;
      box-shadow: 0 5px 12px rgba(0,0,0,0.3);
      text-decoration: none;
    }
    .link-alternative {
      background: #f5f5f5;
      padding: 12px;
      border-radius: 4px;
      word-break: break-all;
      font-size: 11px;
      color: #333333;
      font-family: 'Courier New', monospace;
      margin-top: 15px;
      border: 1px solid #d0d0d0;
    }
    .link-alternative a {
      color: #2c3e50;
      text-decoration: none;
    }
    .signature {
      margin-top: 50px;
      font-size: 13px;
      line-height: 1.8;
      border-top: 2px solid #d0d0d0;
      padding-top: 20px;
    }
    .signature-name {
      font-weight: bold;
      margin-top: 20px;
      font-style: italic;
    }
    .footer {
      background: #f5f5f5;
      padding: 20px 40px;
      text-align: center;
      border-top: 1px solid #d0d0d0;
      font-size: 11px;
      color: #666666;
      font-family: Arial, sans-serif;
      line-height: 1.6;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Secretaría de Seguridad Pública Municipal</h1>
      <p>Juzgado Cívico - Oficina de Procesos Administrativos</p>
    </div>

    <div class="content">
      <p class="greeting">
        Estimado(a) <strong>${data.nombreTitular}</strong>,
      </p>

      <p class="text-content">
        Por este medio se comunica a usted que su expediente ha sido registrado y asignado al <strong>Juzgado Cívico</strong> de esta dependencia, conforme a los procedimientos administrativos establecidos en la ley.
      </p>

      <div class="section-title">Datos del Expediente</div>
      
      <div class="data-row">
        <div class="data-label">Número de Folio:</div>
        <div class="data-value">${data.folio}</div>
      </div>
      
      <div class="data-row">
        <div class="data-label">Número de Oficio:</div>
        <div class="data-value">${data.numero_oficio}</div>
      </div>
      
      <div class="data-row">
        <div class="data-label">Estado del Expediente:</div>
        <div class="data-value">ASIGNADO A JUZGADO CÍVICO</div>
      </div>

      <hr class="divider-line" />

      <div class="section-title">Requisitos a Cumplir</div>

      <p class="text-content">
        Conforme a lo establecido en los procedimientos administrativos vigentes, se le requiere cargar la documentación solicitada dentro del plazo legal establecido. El incumplimiento de esta obligación puede resultar en la aplicación de sanciones administrativas según corresponda a derecho.
      </p>

      <div class="highlight">
        <strong>⚠ ATENCIÓN:</strong> Es obligatorio subir toda la documentación requerida dentro del plazo establecido. La no presentación de documentos puede afectar la resolución de su expediente.
      </div>

      <p style="text-align: center; margin: 35px 0 20px 0; font-weight: bold; font-family: Arial, sans-serif; color: #2c3e50; font-size: 13px;">
        ACCEDA AL PORTAL DE DOCUMENTACIÓN
      </p>

      <a href="${urlVistaCiudadano}" class="cta-button">
        INGRESAR AL SISTEMA
      </a>

      <p class="text-content" style="text-align: center; margin-top: 25px; font-size: 12px;">
        Si no puede acceder mediante el botón anterior, copie el siguiente enlace en su navegador:
      </p>

      <div class="link-alternative">
        <a href="${urlVistaCiudadano}">${urlVistaCiudadano}</a>
      </div>

      <hr class="divider-line" />

      <div class="signature">
        <p style="margin: 0 0 5px 0;">Respetuosamente,</p>
        
        <div class="signature-name">
          Secretaría de Seguridad Pública Municipal<br/>
          Juzgado Cívico
        </div>
      </div>
    </div>

    <div class="footer">
      <p style="margin: 0;">
        Documento generado automáticamente por el Sistema de Gestión de Expedientes.<br/>
        No responda este correo. Para consultas, comuníquese con la dependencia correspondiente.
      </p>
    </div>
  </div>
</body>
</html>
`;

  return {
    html,
    text,
  };
}
export function templateAsignacionFiscalia(
  data: EnviarCorreoAsignacionJuzgadoParams & { urlVistaCiudadano?: string },
) {
  const baseUrl =
    process.env.NODE_ENV === "production"
      ? "https://via-v2.vercel.app"
      : "http://localhost:3000";

  const urlVistaCiudadano = data.urlVistaCiudadano || `${baseUrl}/infracciones/${data.idInfraccion}`;

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

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    body {
      margin: 0;
      padding: 0;
      background: #ffffff;
      font-family: 'Georgia', 'Times New Roman', serif;
      color: #1a1a1a;
      line-height: 1.6;
    }
    .container {
      max-width: 750px;
      margin: 0 auto;
      padding: 0;
    }
    .header {
      background: #2c3e50;
      color: #ffffff;
      padding: 50px 30px;
      text-align: center;
      border-bottom: 3px solid #c41e3a;
    }
    .header h1 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      letter-spacing: 1px;
      text-transform: uppercase;
      font-family: Arial, sans-serif;
    }
    .header p {
      margin: 8px 0 0 0;
      font-size: 12px;
      opacity: 0.95;
      font-family: Arial, sans-serif;
      letter-spacing: 0.5px;
    }
    .content {
      background: #ffffff;
      padding: 50px 40px;
      border-left: 5px solid #c41e3a;
    }
    .greeting {
      font-size: 14px;
      line-height: 1.8;
      margin: 0 0 30px 0;
      text-align: justify;
    }
    .section-title {
      font-size: 12px;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #2c3e50;
      margin: 30px 0 15px 0;
      border-bottom: 2px solid #e0e0e0;
      padding-bottom: 8px;
      font-family: Arial, sans-serif;
    }
    .data-row {
      display: flex;
      margin-bottom: 12px;
      font-size: 13px;
      line-height: 1.6;
    }
    .data-label {
      font-weight: bold;
      min-width: 200px;
      color: #2c3e50;
    }
    .data-value {
      color: #1a1a1a;
      font-family: 'Courier New', monospace;
      letter-spacing: 0.5px;
    }
    .divider-line {
      border: none;
      border-bottom: 1px solid #d0d0d0;
      margin: 30px 0;
    }
    .text-content {
      font-size: 13px;
      text-align: justify;
      line-height: 1.8;
      margin: 20px 0;
      color: #1a1a1a;
    }
    .highlight {
      background: #fef3c7;
      padding: 20px;
      border-left: 4px solid #f59e0b;
      margin: 25px 0;
      font-size: 13px;
      line-height: 1.8;
      color: #78350f;
      font-weight: 500;
    }
    .highlight strong {
      color: #92400e;
    }
    .cta-button {
      display: inline-block;
      background: #c41e3a;
      color: #ffffff;
      padding: 15px 50px;
      text-decoration: none;
      font-weight: bold;
      font-size: 14px;
      margin: 30px auto;
      display: block;
      text-align: center;
      font-family: Arial, sans-serif;
      letter-spacing: 0.5px;
      box-shadow: 0 3px 8px rgba(0,0,0,0.2);
      border: none;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    .cta-button:hover {
      background: #a01830;
      box-shadow: 0 5px 12px rgba(0,0,0,0.3);
      text-decoration: none;
    }
    .link-alternative {
      background: #f5f5f5;
      padding: 12px;
      border-radius: 4px;
      word-break: break-all;
      font-size: 11px;
      color: #333333;
      font-family: 'Courier New', monospace;
      margin-top: 15px;
      border: 1px solid #d0d0d0;
    }
    .link-alternative a {
      color: #2c3e50;
      text-decoration: none;
    }
    .signature {
      margin-top: 50px;
      font-size: 13px;
      line-height: 1.8;
      border-top: 2px solid #d0d0d0;
      padding-top: 20px;
    }
    .signature-name {
      font-weight: bold;
      margin-top: 20px;
      font-style: italic;
    }
    .footer {
      background: #f5f5f5;
      padding: 20px 40px;
      text-align: center;
      border-top: 1px solid #d0d0d0;
      font-size: 11px;
      color: #666666;
      font-family: Arial, sans-serif;
      line-height: 1.6;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Secretaría de Seguridad Pública Municipal</h1>
      <p>Fiscalía de SJR</p>
    </div>

    <div class="content">
      <p class="greeting">
        Estimado(a) <strong>${data.nombreTitular}</strong>,
      </p>

      <p class="text-content">
        Por este medio se le notifica que su expediente ha sido registrado en <strong>Fiscalía de SJR</strong>. A partir de este momento, puede subir la documentación requerida para continuar con el proceso de liberación de su vehículo.
      </p>

      <div class="section-title">Datos del Expediente</div>
      
      <div class="data-row">
        <div class="data-label">Número de Folio:</div>
        <div class="data-value">${data.folio}</div>
      </div>
      
      <div class="data-row">
        <div class="data-label">Número de Oficio:</div>
        <div class="data-value">${data.numero_oficio}</div>
      </div>
      
      <div class="data-row">
        <div class="data-label">Estado del Expediente:</div>
        <div class="data-value">PENDIENTE DE DOCUMENTACIÓN</div>
      </div>

      <hr class="divider-line" />

      <div class="section-title">Documentación Requerida</div>

      <p class="text-content">
        Para continuar con el proceso de liberación, es necesario que cargue la siguiente documentación a través del portal ciudadano:
      </p>

      <ul style="font-size:13px; line-height:2; color:#1a1a1a; padding-left:20px;">
        <li>Factura original del vehículo</li>
        <li>INE del titular (vigente)</li>
        <li>Comprobante de domicilio (reciente)</li>
        <li>Tarjeta de circulación</li>
        <li>Poder notarial (si aplica)</li>
      </ul>

      <div class="highlight">
        <strong>⚠ ATENCIÓN:</strong> Es obligatorio subir toda la documentación requerida dentro del plazo establecido. La no presentación de documentos puede retrasar el proceso de liberación.
      </div>

      <div style="text-align:center; margin:30px 0;">
        <img
          src="cid:qr_infraccion"
          alt="Código QR"
          width="180"
        />
      </div>

      <p style="text-align: center; margin: 15px 0 20px 0; font-weight: bold; font-family: Arial, sans-serif; color: #2c3e50; font-size: 13px;">
        ACCEDA AL PORTAL DE DOCUMENTACIÓN
      </p>

      <a href="${urlVistaCiudadano}" class="cta-button">
        SUBIR DOCUMENTACIÓN
      </a>

      <p class="text-content" style="text-align: center; margin-top: 25px; font-size: 12px;">
        Si no puede acceder mediante el botón anterior, copie el siguiente enlace en su navegador:
      </p>

      <div class="link-alternative">
        <a href="${urlVistaCiudadano}">${urlVistaCiudadano}</a>
      </div>

      <hr class="divider-line" />

      <div class="signature">
        <p style="margin: 0 0 5px 0;">Respetuosamente,</p>
        
        <div class="signature-name">
          Secretaría de Seguridad Pública Municipal<br/>
          Fiscalía de SJR
        </div>
      </div>
    </div>

    <div class="footer">
      <p style="margin: 0;">
        Documento generado automáticamente por el Sistema de Gestión de Expedientes.<br/>
        No responda este correo. Para consultas, comuníquese con la dependencia correspondiente.
      </p>
    </div>
  </div>
</body>
</html>
`;

  return {
    html,
    text,
  };
}
