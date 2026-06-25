import { emailLayout, emailStyles, inlineStyles } from "../styles";

type PendingApprovalParams = {
  nombres: string;
};

export function templatePendingApproval(data: PendingApprovalParams) {
  const html = emailLayout(`
    <div style="${inlineStyles(emailStyles.imageCenter)}">
      <img
        src="https://via-v2.vercel.app/roles/Estrella.png"
        alt="SSPM"
        style="${inlineStyles(emailStyles.logo)}"
      />
    </div>

    <h1 style="${inlineStyles(emailStyles.titleCenter)}">
      Cuenta creada exitosamente
    </h1>

    <p style="${inlineStyles(emailStyles.subtitleCenter)}">
      Secretaría de Seguridad Pública Municipal
    </p>

    <p style="${inlineStyles(emailStyles.greeting)}">
      Hola <strong>${data.nombres}</strong>,
    </p>

    <p style="${inlineStyles(emailStyles.body)}">
      Te damos la bienvenida al Sistema de Gestión de Infracciones SSPM.
      Tu cuenta ha sido registrada correctamente y se encuentra en
      <strong>proceso de revisión</strong>.
    </p>

    <div style="${inlineStyles(emailStyles.infoBox)}">
      <p style="${inlineStyles(emailStyles.infoBoxText)}">
        En breve un administrador te asignará los permisos necesarios
        para acceder al sistema. Recibirás un correo de confirmación
        cuando tu cuenta esté lista.
      </p>
    </div>

    <p style="${inlineStyles(emailStyles.contact)}">
      Si tienes alguna duda, contacta al soporte técnico:
      <br />
      <a href="mailto:sistemas@sanjuandelrio.gob.mx" style="${inlineStyles(emailStyles.contactLink)}">
        sistemas@sanjuandelrio.gob.mx
      </a>
    </p>
  `);

  const text = `
SSPM - Cuenta creada exitosamente

Hola ${data.nombres},

Te damos la bienvenida al Sistema de Gestión de Infracciones SSPM.
Tu cuenta ha sido registrada correctamente y se encuentra en proceso de revisión.

En breve un administrador te asignará los permisos necesarios
para acceder al sistema. Recibirás un correo de confirmación
cuando tu cuenta esté lista.

Si tienes alguna duda, contacta al soporte técnico:
sistemas@sanjuandelrio.gob.mx

Este es un mensaje automático generado por el Sistema de Gestión
de Infracciones de la Secretaría de Seguridad Pública Municipal.
  `;

  return { html, text };
}
