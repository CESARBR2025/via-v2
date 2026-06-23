import { FilePlus, ClipboardCheck, FileClockIcon, AtSign, Users, Settings, MapPin, Building2, ArrowUpDown, User, LayoutDashboard, Shield, KeyRound } from "lucide-react";

import { UserRole } from "./types";

export const navigationByRole: Record<UserRole, any[]> = {
  admin: [
    {
      title: "Dashboard",
      items: [
        {
          label: "Inicio",
          href: "/admin/dashboard",
          icon: LayoutDashboard,
        },
      ],
    },
    {
      title: "Indicadores",
      items: [
        {
          label: "KPIs",
          href: "/admin/kpis",
          icon: LayoutDashboard,
        },
      ],
    },
    {
      title: "Gestión",
      items: [
        {
          label: "Oficiales",
          href: "/admin/oficiales",
          icon: Users,
        },
      ],
    },
    {
      title: "Configuración",
      items: [
        {
          label: "Catálogos",
          href: "/admin/configuracion",
          icon: Settings,
        },
      ],
    },
  ],

  super_admin: [
    {
      title: "Dashboard",
      items: [
        {
          label: "Inicio",
          href: "/admin/dashboard",
          icon: LayoutDashboard,
        },
      ],
    },
    {
      title: "Indicadores",
      items: [
        {
          label: "KPIs",
          href: "/admin/kpis",
          icon: LayoutDashboard,
        },
      ],
    },
    {
      title: "Gestión",
      items: [
        {
          label: "Oficiales",
          href: "/admin/oficiales",
          icon: Users,
        },
        {
          label: "Usuarios",
          href: "/admin/usuarios",
          icon: Shield,
        },
      ],
    },
    {
      title: "Configuración",
      items: [
        {
          label: "Catálogos",
          href: "/admin/configuracion",
          icon: Settings,
        },
      ],
    },
    {
      title: "Seguridad",
      items: [
        {
          label: "Roles y Permisos",
          href: "/admin/roles-permisos",
          icon: KeyRound,
        },
      ],
    },
  ],

  fiscalia: [
    // =====================================
    // SECCIÓN
    // =====================================

    {
      title: "Infracciones ",

      items: [
        {
          label: "Asignadas",
          href: "/externos/fiscalia/dashboard",
          icon: AtSign,
        },
      ],
    },
  ],

  oficial: [
    {
      title: "Dashboard",
      items: [
        {
          label: "Inicio",
          href: "/oficiales/dashboard",
          icon: LayoutDashboard,
        },
      ],
    },
    {
      title: "Infracciones",

      items: [
        {
          label: "Capturar",
          href: "/oficiales/captura",
          icon: FilePlus,
        },
        {
          label: "Realizadas",
          href: "/oficiales/realizadas",
          icon: ClipboardCheck,
        },
      ],
    },
    {
      title: "Mi Cuenta",

      items: [
        {
          label: "Mi Perfil",
          href: "/oficiales/perfil",
          icon: User,
        },
      ],
    },
  ],

  infracciones: [
    // =====================================
    // SECCIÓN
    // =====================================

    {
      title: "Infracciones Registradas",

      items: [
        {
          label: "Infracciones",
          href: "/depInfracciones/dashboard",
          icon: FileClockIcon,
        },
      ],
    },
  ],

  liberaciones: [
    // =====================================
    // SECCIÓN
    // =====================================

    {
      title: "Infracciones Registradas",

      items: [
        {
          label: "Liberaciones",
          href: "/depLiberaciones/dashboard",
          icon: FileClockIcon,
        },
      ],
    },
  ],

  corralon_mejia: [
    // =====================================
    // SECCIÓN
    // =====================================

    {
      title: "Vehiculos retenidos",

      items: [
        {
          label: "Vehiculos",
          href: "/externos/corralonMejia/dashboard",
          icon: FileClockIcon,
        },
      ],
    },
  ],

  juzgado_civico: [
    {
      title: "Infracciones",

      items: [
        {
          label: "Asignadas",
          href: "/externos/juzgadoCivico/dashboard",
          icon: AtSign,
        },
      ],
    },
  ],

  corralon_mw: [
    // =====================================
    // SECCIÓN
    // =====================================

    {
      title: "Vehiculos retenidos",

      items: [
        {
          label: "Vehiculos",
          href: "/externos/corralonMW/dashboard",
          icon: FileClockIcon,
        },
      ],
    },
  ],
};
