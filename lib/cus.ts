//Funcion que recibe curp y password para VALIDAR login con CUS
export async function cusLogin(curp: string, password: string) {
  const res = await fetch(process.env.VALIDA_CUS_URL!, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.X_API_KEY!,
    },
    body: JSON.stringify({
      username: curp,
      password,
    }),
  });

  const text = await res.text();

  if (!res.ok) {
    return {
      ok: false,
      status: res.status,
      text,
    };
  }

  return {
    ok: true,
    text,
  };
}

//Funcion que se encarga de tomar id_usuario_general
// Obtener datos de contacto basicos
export async function cusGetUserInfo(idUsuario: string) {
  const res = await fetch(`${process.env.GET_USERINFO_URL}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-KEY": process.env.X_API_KEY!,
    },
    body: JSON.stringify({
      id_usuario_general: idUsuario,
    }),
  });

  if (!res.ok) {
    throw new Error("Error obteniendo info de usuario CUSGetUserInfo");
  }

  return res.json();
}
