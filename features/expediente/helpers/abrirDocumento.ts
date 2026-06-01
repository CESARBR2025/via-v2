export const abrirDocumento = async (rutaRelativa: string) => {
  try {
    const tokenRes = await fetch("/api/exp-digital/token");

    const { token } = await tokenRes.json();

    const url = `${process.env.NEXT_PUBLIC_EXPEDIENTE_HOST}${rutaRelativa}`;

    const fileRes = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!fileRes.ok) {
      throw new Error("No fue posible obtener el documento");
    }

    const blob = await fileRes.blob();

    const blobUrl = window.URL.createObjectURL(blob);

    window.open(blobUrl, "_blank", "noopener,noreferrer");

    setTimeout(() => {
      URL.revokeObjectURL(blobUrl);
    }, 60000);
  } catch (error) {
    console.error("Error abriendo documento", error);
  }
};
