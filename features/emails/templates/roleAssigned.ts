import { emailLayout, emailStyles, inlineStyles } from "../styles";

type RoleAssignedParams = {
  nombres: string;
  rol: string;
};

export function templateRoleAssigned(data: RoleAssignedParams) {
  const html = emailLayout(`
    <div style="${inlineStyles(emailStyles.imageCenter)}">
      <img
        src="https://via-v2.vercel.app/roles/Estrella.png"
        alt="SSPM"
        style="${inlineStyles(emailStyles.logo)}"
      />
    </div>

    <h1 style="${inlineStyles(emailStyles.titleCenter)}">
      Cuenta lista — Rol asignado
    </h1>

    <p style="${inlineStyles(emailStyles.subtitleCenter)}">
      Secretaría de Seguridad Pública Municipal
    </p>

    <p style="${inlineStyles(emailStyles.greeting)}">
      Hola <strong>${data.nombres}</strong>,
    </p>

    <p style="${inlineStyles(emailStyles.body)}">
      Tu cuenta ha sido habilitada. Se te ha asignado el rol de
      <strong>${data.rol}</strong> en el Sistema de Gestión de
      Infracciones SSPM.
    </p>

    <div style="${inlineStyles(emailStyles.successBox)}">
      <p style="${inlineStyles(emailStyles.successBoxTitle)}">
        Ya puedes acceder al sistema
      </p>

      <a
        href="https://via-v2.vercel.app/login"
        style="${inlineStyles(emailStyles.primaryButton)}"
      >
        Iniciar sesión
      </a>
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
SSPM - Cuenta lista - Rol asignado

Hola ${data.nombres},

Tu cuenta ha sido habilitada. Se te ha asignado el rol de ${data.rol}
en el Sistema de Gestión de Infracciones SSPM.

Ya puedes acceder al sistema ingresando a:
https://via-v2.vercel.app/login

Si tienes alguna duda, contacta al soporte técnico:
sistemas@sanjuandelrio.gob.mx

Este es un mensaje automático generado por el Sistema de Gestión
de Infracciones de la Secretaría de Seguridad Pública Municipal.
  `;

  return { html, text };
}
