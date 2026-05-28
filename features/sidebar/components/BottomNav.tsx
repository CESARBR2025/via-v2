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

  const navigation =
    navigationByRole[role]
      ?.flatMap(
        (section) => section.items
      ) || [];

  return (
    <nav className="
      md:hidden
      fixed bottom-0 left-0 right-0
      h-[64px] bg-[#FFFFFF]
      border-t border-[#EAF1FC]
      z-40
      flex
      shadow-[0_-2px_12px_rgba(31,105,231,0.04)]
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
              text-[11px] font-medium gap-1
              transition-all duration-200
              relative

              ${active
                ? "text-[#1F69E7]"
                : "text-[#8A96B0] hover:text-[#6B778C]"
              }
            `}
          >
            {active && (
              <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[3px] bg-[#1F69E7] rounded-b-full" />
            )}

            <Icon
              size={20}
              className={`
                transition-colors duration-200
                ${active
                  ? "text-[#1F69E7]"
                  : "text-[#8A96B0]"
                }
              `}
            />

            <span>{item.label}</span>
          </Link>
        );
      })}

    </nav>
  );
}
