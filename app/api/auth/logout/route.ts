import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({
    ok: true,
  });

  const expiredCookie = {
    value: "",
    expires: new Date(0),
    path: "/",
  };

  // 🔴 sesión principal (JWT con user + roles + permisos)
  res.cookies.set("session_token", expiredCookie.value, {
    expires: expiredCookie.expires,
    path: expiredCookie.path,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  // 🟡 flujo multi-rol
  res.cookies.set("pre_session", expiredCookie.value, {
    expires: expiredCookie.expires,
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  return res;
}
