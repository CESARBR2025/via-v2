import QRCode from "qrcode";
import { sendMail } from "./mailer";

import { templateInfraccion } from "./templates/sendInfraccion";

type EnviarCorreoParams = {
  idInfraccion: string;
  correoInfractor: string;
  nombreInfractor: string;
  folio: string;
};

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
