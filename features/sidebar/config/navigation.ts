import {
  Home,
  FileExclamationPoint,
  FileClockIcon,
  AtSign,
} from "lucide-react";

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
    // =====================================
    // SECCIÓN
    // =====================================

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
        {
          label: "Fiscalia",
          href: "/externos/fiscalia/dashboard",
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
};
