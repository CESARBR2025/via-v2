"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { navigationByRole }
  from "../config/navigation";

import { UserRole }
  from "../types";

type Props = {
  role: UserRole;
};

export default function BottomNav({
  role,
}: Props) {

  const pathname = usePathname();

  // =====================================
  // OBTENER TODOS LOS ITEMS
  // =====================================

  const navigation =
    navigationByRole[role]
      ?.flatMap(
        (section) => section.items
      ) || [];

  return (
    <div className="
            md:hidden
            fixed bottom-0 left-0 right-0
            h-16 bg-white
            border-t border-slate-200
            z-40
            flex
        ">

      {navigation.map((item) => {

        const active =
          pathname === item.href;

        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`
                            flex-1 flex flex-col
                            items-center justify-center
                            text-xs gap-1
                            transition-colors

                            ${active
                ? "text-[#0b3b60]"
                : "text-slate-500"
              }
                        `}
          >
            <Icon size={20} />

            <span>{item.label}</span>
          </Link>
        );
      })}

    </div>
  );
}