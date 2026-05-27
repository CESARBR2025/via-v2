"use client";

import { Menu } from "lucide-react";


import { useSidebarStore } from "@/stores/sideBarStore";

export default function Header() {

  const toggleMobile =
    useSidebarStore(
      (s) => s.toggleMobile
    );

  return (
    <header className="
            h-16 border-b border-slate-200
            bg-white
            px-4
            flex items-center
        ">

      <button
        onClick={toggleMobile}
        className="
                    md:hidden
                    w-10 h-10
                    rounded-xl
                    hover:bg-slate-100
                    flex items-center justify-center
                "
      >
        <Menu size={20} />
      </button>

    </header>
  );
}