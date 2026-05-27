import {
  House,
  Users,
  Settings,
  Calendar,
  UserPlus,
  UserRoundCheck,
  UserKey,
} from "lucide-react";

export type UserRole = "ADMIN" | "OTRO" | "MESERO" | "COCINA";

export const menuByRole: Record<UserRole, any[]> = {
  ADMIN: [
    {
      label: "Usuarios",
      icon: Users,
      group: "Principal",
      children: [
        {
          icon: UserPlus,
          label: "Solicitudes",
          href: "/admin/usuarios/solicitudes",
        },
        {
          icon: UserRoundCheck,
          label: "Actuales",
          href: "/admin/usuarios/actuales",
        },
      ],
    },
    {
      label: "Roles",
      href: "/admin/control/roles-permisos",
      icon: UserKey,
      group: "Principal",
    },
    {
      label: "Eventos",
      href: "/admin/eventos",
      icon: Calendar,
      group: "Principal",
    },
    {
      label: "Configuración",
      href: "/admin/configuracion",
      icon: Settings,
      group: "Sistema",
    },
  ],

  OTRO: [
    {
      label: "KPIs",
      href: "/admin",
      icon: House,
      group: "Principal",
    },
    {
      label: "Eventos",
      href: "/admin/eventos",
      icon: Calendar,
      group: "Principal",
    },
  ],

  MESERO: [],

  COCINA: [],
};
