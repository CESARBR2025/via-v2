import { getExpedienteToken } from "@/lib/expediente-digital/expediente";

export async function GET() {
  const token = await getExpedienteToken();
  return Response.json({ token });
}
