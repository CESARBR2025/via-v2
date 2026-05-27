"use client";

import { navigation } from "../config/navigation";
import SidebarItem from "./SideBarItem";

export default function Sidebar() {

  return (
    <aside className="
            hidden md:flex
            w-72
            border-r border-slate-200
            bg-white
            flex-col
            p-4
        ">

      {/* LOGO */}

      <div className="px-2 py-4">

        <h1 className="
                    text-2xl
                    font-black
                    text-[#0b3b60]
                ">
          VIA
        </h1>

      </div>

      {/* NAV */}

      <nav className="flex flex-col gap-2 mt-6">

        {navigation.map((item) => (

          <SidebarItem
            key={item.href}
            {...item}
          />

        ))}

      </nav>

    </aside>
  );
}