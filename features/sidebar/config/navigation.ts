import { Home, FileClockIcon, AtSign } from "lucide-react";

import { UserRole } from "./types";

export const navigationByRole: Record<UserRole, any[]> = {
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
