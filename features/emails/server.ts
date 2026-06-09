import QRCode from "qrcode";
import { sendMail } from "./mailer";

import {
  templateAsignacionFiscalia,
  templateAsignacionJuzgado,
  templateInfraccion,
} from "./templates/sendInfraccion";

type EnviarCorreoParams = {
  idInfraccion: string;
  correoInfractor: string;
  nombreInfractor: string;
  folio: string;
};

type EnviarCorreoOrdenParams = {
  idInfraccion: string;
  correoInfractor: string;
  nombreInfractor: string;
  folio: string;
  pdfBuffer: Buffer;
};

export interface EnviarCorreoAsignacionJuzgadoParams {
  correo_titular_liberacion: string;
  nombreTitular: string;
  folio: string;
  numero_oficio: string;
}

export async function enviarCorreoInfraccion(data: EnviarCorreoParams) {
  const baseUrl =
    process.env.NODE_ENV === "production"
      ? "https://via-v2.vercel.app"
      : "http://localhost:3000";

  /**
   * URL pública del ciudadano
   */
  const urlVistaCiudadano = `${baseUrl}/infracciones/${data.idInfraccion}`;

  /**
   * Generar QR en base64
   */
  const qrBuffer = await QRCode.toBuffer(urlVistaCiudadano);

  /**
   * Template HTML
   */
  const { html, text } = templateInfraccion({
    ...data,
    urlVistaCiudadano,
  });

  /**
   * Enviar correo
   */
  await sendMail({
    to: data.correoInfractor,
    subject: `SSPM - Infracción Registrada #${data.folio}`,
    text,
    html,

    attachments: [
      {
        filename: "qr.png",
        content: qrBuffer,
        cid: "qr_infraccion",
      },
    ],
  });
}

export async function enviarCorreoAsignacionJuzgado(
  data: EnviarCorreoAsignacionJuzgadoParams,
) {
  const { html, text } = templateAsignacionJuzgado(data);

  await sendMail({
    to: data.correo_titular_liberacion,
    subject: `SSPM - Asignación de Infracción ${data.folio}`,
    text,
    html,
  });
}

export async function enviarCorreoAsignacionFiscalia(
  data: EnviarCorreoAsignacionJuzgadoParams,
) {
  const { html, text } = templateAsignacionFiscalia(data);

  await sendMail({
    to: data.correo_titular_liberacion,
    subject: `SSPM - Asignación de Infracción ${data.folio}`,
    text,
    html,
  });
}

// ========================

export async function enviarOrdenLiberacionCorreo(
  data: EnviarCorreoOrdenParams,
) {
  const baseUrl =
    process.env.NODE_ENV === "production"
      ? "https://via-v2.vercel.app"
      : "http://localhost:3000";

  const urlVistaCiudadano = `${baseUrl}/infracciones/${data.idInfraccion}`;

  const qrBuffer = await QRCode.toBuffer(urlVistaCiudadano);

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto;">
      
      <h2 style="color: #0f766e;">
        Orden de Liberación Emitida
      </h2>

      <p>
        Estimado(a) <strong>${data.nombreInfractor}</strong>,
      </p>

      <p>
        Le informamos que la revisión de la documentación correspondiente
        a la infracción con folio <strong>${data.folio}</strong>
        ha sido concluida satisfactoriamente.
      </p>

      <p>
        Su vehículo ha sido autorizado para liberación y la
        <strong>Orden de Salida</strong> se encuentra adjunta a este correo
        en formato PDF.
      </p>

      <p>
        Le recomendamos conservar este documento y presentarlo
        cuando sea requerido durante el proceso de entrega del vehículo.
      </p>

      <div style="text-align:center; margin:30px 0;">
        <img
          src="cid:qr_infraccion"
          alt="QR"
          width="180"
        />
      </div>

      <p>
        También puede consultar el seguimiento de su trámite en:
      </p>

      <p>
        <a href="${urlVistaCiudadano}">
          ${urlVistaCiudadano}
        </a>
      </p>

      <hr />

      <p style="font-size:12px; color:#666;">
        Este es un mensaje automático generado por el Sistema de Infracciones
        de la Secretaría de Seguridad Pública Municipal.
      </p>

    </div>
  `;

  const text = `
Orden de Liberación Emitida

Estimado(a) ${data.nombreInfractor},

La revisión de su documentación ha sido aprobada.

Folio: ${data.folio}

Su vehículo ha sido autorizado para liberación.

La Orden de Salida se encuentra adjunta a este correo en formato PDF.

Puede consultar el seguimiento de su trámite en:
${urlVistaCiudadano}
`;

  const attachments: any[] = [
    {
      filename: "qr.png",
      content: qrBuffer,
      cid: "qr_infraccion",
    },
  ];

  if (data.pdfBuffer) {
    attachments.push({
      filename: `orden_liberacion_${data.folio}.pdf`,
      content: data.pdfBuffer,
      contentType: "application/pdf",
    });
  }

  await sendMail({
    to: data.correoInfractor,
    subject: `SSPM - Orden de Liberación #${data.folio}`,
    text,
    html,
    attachments,
  });
}
