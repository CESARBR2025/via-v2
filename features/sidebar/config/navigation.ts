import { Home, FileClockIcon, AtSign, Users, Settings, MapPin, Building2, ArrowUpDown } from "lucide-react";

import { UserRole } from "./types";

export const navigationByRole: Record<UserRole, any[]> = {
  admin: [
    {
      title: "Gestión",
      items: [
        {
          label: "Oficiales",
          href: "/admin/oficiales",
          icon: Users,
        },
        {
          label: "Sectores",
          href: "/admin/sectores",
          icon: MapPin,
        },
        {
          label: "Departamentos",
          href: "/admin/departamentos",
          icon: Building2,
        },
        {
          label: "Rangos",
          href: "/admin/rangos",
          icon: ArrowUpDown,
        },
      ],
    },
    {
      title: "Sistema",
      items: [
        {
          label: "Configuración",
          href: "/admin/dashboard",
          icon: Settings,
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
      title: "Infracciones",

      items: [
        {
          label: "Capturar",
          href: "/oficiales/captura",
          icon: Home,
        },
        {
          label: "Realizadas",
          href: "/oficiales/realizadas",
          icon: Home,
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
