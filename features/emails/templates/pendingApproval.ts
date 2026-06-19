type PendingApprovalParams = {
  nombres: string;
};

export function templatePendingApproval(data: PendingApprovalParams) {
  const html = `
    <div style="
      font-family: Arial, sans-serif;
      background: #f5f7fb;
      padding: 40px;
    ">
      <div style="
        max-width: 560px;
        margin: auto;
        background: #ffffff;
        border-radius: 16px;
        padding: 40px;
        border: 1px solid #e5e7eb;
      ">
        <div style="text-align: center; margin-bottom: 24px;">
          <img
            src="https://via-v2.vercel.app/roles/Estrella.png"
            alt="SSPM"
            width="64"
            height="64"
            style="display: inline-block;"
          />
        </div>

        <h1 style="
          color: #1e3a8a;
          font-size: 22px;
          text-align: center;
          margin: 0 0 8px 0;
        ">
          Cuenta creada exitosamente
        </h1>

        <p style="
          color: #64748b;
          font-size: 14px;
          text-align: center;
          margin: 0 0 24px 0;
        ">
          Secretaría de Seguridad Pública Municipal
        </p>

        <p style="
          color: #334155;
          font-size: 14px;
          line-height: 1.6;
          margin: 0 0 16px 0;
        ">
          Hola <strong>${data.nombres}</strong>,
        </p>

        <p style="
          color: #334155;
          font-size: 14px;
          line-height: 1.6;
          margin: 0 0 16px 0;
        ">
          Te damos la bienvenida al Sistema de Gestión de Infracciones SSPM.
          Tu cuenta ha sido registrada correctamente y se encuentra en
          <strong>proceso de revisión</strong>.
        </p>

        <div style="
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          border-radius: 12px;
          padding: 20px;
          margin: 24px 0;
        ">
          <p style="
            margin: 0;
            color: #1e40af;
            font-size: 14px;
            line-height: 1.6;
          ">
            En breve un administrador te asignará los permisos necesarios
            para acceder al sistema. Recibirás un correo de confirmación
            cuando tu cuenta esté lista.
          </p>
        </div>

        <p style="
          color: #64748b;
          font-size: 13px;
          line-height: 1.6;
          margin: 0;
        ">
          Si tienes alguna duda, contacta al soporte técnico:
          <br />
          <a href="mailto:sistemas@sanjuandelrio.gob.mx" style="color: #2563eb;">
            sistemas@sanjuandelrio.gob.mx
          </a>
        </p>

        <hr style="
          border: none;
          border-top: 1px solid #e2e8f0;
          margin: 24px 0;
        " />

        <p style="
          color: #94a3b8;
          font-size: 11px;
          text-align: center;
          margin: 0;
        ">
          Este es un mensaje automático generado por el Sistema de Gestión
          de Infracciones de la Secretaría de Seguridad Pública Municipal.
        </p>
      </div>
    </div>
  `;

  const text = `
SSPM - Cuenta creada exitosamente

Hola ${data.nombres},

Te damos la bienvenida al Sistema de Gesti�n de Infracciones SSPM.
Tu cuenta ha sido registrada correctamente y se encuentra en proceso de revisi�n.

En breve un administrador te asignar� los permisos necesarios
para acceder al sistema. Recibir�s un correo de confirmaci�n
cuando tu cuenta est� lista.

Si tienes alguna duda, contacta al soporte t�cnico:
sistemas@sanjuandelrio.gob.mx

Este es un mensaje autom�tico generado por el Sistema de Gesti�n
de Infracciones de la Secretar�a de Seguridad P�blica Municipal.
  `;

  return { html, text };
}
