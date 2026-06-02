let cachedToken: { token: string; expiresAt: number } | null = null;

export async function getExpedienteToken(): Promise<string> {
  const ahora = Date.now();

  if (cachedToken && cachedToken.expiresAt - ahora > 5 * 60 * 1000) {
    return cachedToken.token;
  }

  const res = await fetch(
    `${process.env.EXPEDIENTE_HOST}/api/auth/guest-token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        codigo_invitacion: process.env.EXPEDIENTE_CODIGO_INVITACION,
        nombre_invitado: "SSPM Sistema",
      }),
    },
  );

  if (!res.ok) {
    throw new Error("Error al generar token del Expediente Digital");
  }

  const data = await res.json();

  cachedToken = {
    token: data.token,
    expiresAt: ahora + 60 * 60 * 1000,
  };

  return cachedToken.token;
}
