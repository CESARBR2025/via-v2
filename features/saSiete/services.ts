// 1) Generar orden de pago
export async function generarOrdenPago(payload: {
  infraccion_id: number;
  nombre_usuario: string;
  apellidos_usuario: string;
  concepto_id: number;
  folio: string;
  correoInfractor: string;
  descuentoAplicado: string;
}) {
  console.log(payload);
  const res = await fetch("/api/saSiete/generar-orden-pago", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error("Error generando orden de pago");
  }

  return res.json();
}

export async function actualizarOrdenPago(payload: {
  infraccion_id: string;
  nombre_usuario: string;
  apellidos_usuario: string;
  concepto_id: string;
  folio: string;
  cantidad?: number;
}) {
  console.log(payload.infraccion_id);
  const baseUrl =
    process.env.NODE_ENV === "production"
      ? "https://via-v2.vercel.app"
      : "http://localhost:3000";

  const res = await fetch(`${baseUrl}/api/saSiete/actualizar-orden-pago`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error("Error generando orden de pago");
  }

  return res.json();
}
