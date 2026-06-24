import QRCode from "qrcode";
import { sendMail } from "./mailer";

import {
  templateAsignacionFiscalia,
  templateAsignacionJuzgado,
  templateCapturaInfractor,
  templateInfraccion,
  templateLiberacion,
} from "./templates/sendInfraccion";
import { templatePendingApproval } from "./templates/pendingApproval";
import { templateRoleAssigned } from "./templates/roleAssigned";

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
  idInfraccion: string;
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

export async function enviarCorreoCapturaInfractor(data: EnviarCorreoParams) {
  const baseUrl =
    process.env.NODE_ENV === "production"
      ? "https://via-v2.vercel.app"
      : "http://localhost:3000";

  const urlVistaCiudadano = `${baseUrl}/infracciones/${data.idInfraccion}`;

  const qrBuffer = await QRCode.toBuffer(urlVistaCiudadano);

  const { html, text } = templateCapturaInfractor({
    ...data,
    urlVistaCiudadano,
  });

  await sendMail({
    to: data.correoInfractor,
    subject: `SSPM - Documentación Requerida #${data.folio}`,
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
  const baseUrl =
    process.env.NODE_ENV === "production"
      ? "https://via-v2.vercel.app"
      : "http://localhost:3000";

  const urlVistaCiudadano = `${baseUrl}/infracciones/${data.idInfraccion}`;

  const qrBuffer = await QRCode.toBuffer(urlVistaCiudadano);

  const { html, text } = templateAsignacionFiscalia({
    ...data,
    urlVistaCiudadano,
  });

  await sendMail({
    to: data.correo_titular_liberacion,
    subject: `SSPM - Documentación Requerida #${data.folio}`,
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
type EnviarRegistroPendienteParams = {
  correo: string;
  nombres: string;
};

type EnviarRolAsignadoParams = {
  correo: string;
  nombres: string;
  rol: string;
};

export async function enviarCorreoRegistroPendiente(
  data: EnviarRegistroPendienteParams,
) {
  const { html, text } = templatePendingApproval({
    nombres: data.nombres,
  });

  await sendMail({
    to: data.correo,
    subject: "SSPM - Cuenta creada, pendiente de autorización",
    text,
    html,
  });
}

export async function enviarCorreoRolAsignado(
  data: EnviarRolAsignadoParams,
) {
  const { html, text } = templateRoleAssigned({
    nombres: data.nombres,
    rol: data.rol,
  });

  await sendMail({
    to: data.correo,
    subject: `SSPM - Rol asignado: ${data.rol}`,
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

  const { html, text } = templateLiberacion({
    ...data,
    urlVistaCiudadano,
  });

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
