type TemplateParams = {
  nombreInfractor: string;
  folio: string;
  urlVistaCiudadano: string;
};

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
