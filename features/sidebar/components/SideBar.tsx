"use client";

import { navigationByRole }
  from "../config/navigation";

import SidebarItem from "./SideBarItem";


type Props = {
  role: string;
};

export default function Sidebar({
  role,
}: Props) {

  const navigation =
    navigationByRole[
    role as keyof typeof navigationByRole
    ] || [];

  return (
    <aside className="
            hidden md:flex
            w-72
            border-r border-slate-200
            bg-white
            flex-col
            p-4
        ">
      {/* HEADER */}

      <div className="
                    h-16
                    flex items-center
                    justify-between
                ">

        <h2 className="
                        text-2xl font-black
                        text-[#0b3b60]
                    ">
          VIA
        </h2>



      </div>

      <nav className="
                flex flex-col gap-2
            ">

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