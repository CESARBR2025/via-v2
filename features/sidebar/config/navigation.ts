import { Home, FileText, Shield, Settings } from "lucide-react";

import { UserRole } from "../types";

export const navigationByRole: Record<UserRole, any[]> = {
  oficial: [
    {
      label: "Registrar",
      href: "/oficiales/captura",
      icon: Home,
    },
  ],

  oficiales: [
    {
      label: "Registrar",
      href: "/oficiales/captura",
      icon: Home,
    },
  ],
};
