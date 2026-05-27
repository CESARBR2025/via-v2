"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { navigation } from "../config/navigation";

export default function BottomNav() {

  const pathname = usePathname();

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