import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const publicRoutes = [
  "/login",
  "/seleccionar-rol",
  "/pending-approval",
  "/consulta",
  "/infracciones",
  "/api",
];

const roleRouteMap: Record<string, string[]> = {
  "/admin": ["admin", "super_admin"],
  "/oficiales": ["oficial"],
  "/depInfracciones": ["infracciones"],
  "/depLiberaciones": ["liberaciones"],
  "/externos/fiscalia": ["fiscalia"],
  "/externos/juzgadoCivico": ["juzgado_civico"],
  "/externos/corralonMejia": ["corralon_mejia"],
  "/externos/corralonMW": ["corralon_mw"],
};

const roleDashboard: Record<string, string> = {
  super_admin: "/admin/dashboard",
  admin: "/admin/dashboard",
  oficial: "/oficiales/dashboard",
  infracciones: "/depInfracciones/dashboard",
  liberaciones: "/depLiberaciones/dashboard",
  fiscalia: "/externos/fiscalia/dashboard",
  juzgado_civico: "/externos/juzgadoCivico/dashboard",
  corralon_mejia: "/externos/corralonMejia/dashboard",
  corralon_mw: "/externos/corralonMW/dashboard",
  ciudadano: "/consulta",
};

function redirectToLogin(request: NextRequest) {
  return NextResponse.redirect(new URL("/login", request.url));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Allow static files
  if (pathname.match(/\.(ico|png|jpg|jpeg|svg|css|js|json|webp)$/)) {
    return NextResponse.next();
  }

  const sessionToken = request.cookies.get("session_token")?.value;

  if (!sessionToken) {
    return redirectToLogin(request);
  }

  // Verificar que la ruta actual corresponde a uno de los roles del usuario
  const requiredEntry = Object.entries(roleRouteMap).find(([prefix]) =>
    pathname.startsWith(prefix),
  );

  if (requiredEntry) {
    const [_, allowedRoles] = requiredEntry;

    try {
      const secret = new TextEncoder().encode(
        process.env.JWT_SECRET_COOKIE || "",
      );
      const { payload } = await jwtVerify(sessionToken, secret, {
        algorithms: ["HS256"],
      });

      const userRoles = (payload as any)?.user?.roles as string[] | undefined;

      if (!userRoles || !userRoles.some((r) => allowedRoles.includes(r))) {
        const redirectPath =
          userRoles && userRoles.length > 0
            ? roleDashboard[userRoles[0]] || "/login"
            : "/login";
        return NextResponse.redirect(new URL(redirectPath, request.url));
      }
    } catch {
      return redirectToLogin(request);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/).*)",
  ],
};
