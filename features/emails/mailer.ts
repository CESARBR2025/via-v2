import nodemailer from "nodemailer";
import path from "path";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export interface MailAttachment {
  filename: string;
  path?: string;
  content?: Buffer;
  cid?: string;
}

export interface MailOptions {
  to?: string;
  subject: string;
  text: string;
  html: string;
  attachments?: MailAttachment[];
}

export async function sendMail(options: MailOptions) {
  if (!options.to) {
    console.warn("[mailer] Correo no proporcionado, omitiendo envío.");
    return null;
  }

  const info = await transporter.sendMail({
    from: `"SSPM - San Juan del Río" <${process.env.SMTP_USER}>`,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,

    attachments: [
      /**
       * Attachments dinámicos
       */
      ...(options.attachments ?? []),
    ],
  });

  return info;
}
