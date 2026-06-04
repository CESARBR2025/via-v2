import { Home, FileExclamationPoint, FileClockIcon } from "lucide-react";

import { UserRole } from "./types";

export const navigationByRole: Record<UserRole, any[]> = {
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
      ],
    },
  ],

  oficiales: [
    // =====================================
    // SECCIÓN
    // =====================================

    {
      title: "Infracciones",

      items: [
        {
          label: "Capturar",
          href: "/oficiales/capturar",
          icon: Home,
        },
        {
          label: "Realizadas321",
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
};
