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
