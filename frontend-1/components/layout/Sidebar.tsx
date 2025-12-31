"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import {ChevronDown} from "lucide-react"

import { SECTION_ONE,SECTION_TWO,SECTION_THREE,CATEGORIES} from "@/data/Sidebar"

type SidebarProps = {
  open: boolean
  setOpen: (value: boolean) => void
}

const NAVBAR_HEIGHT = "64px"

export default function Sidebar({ open, setOpen }: SidebarProps) {
  const pathname = usePathname()
  const [categoriesOpen, setCategoriesOpen] = useState(true)

  const NavItem = ({ item }: any) => {
    const isActive = pathname === item.href
    return (
      <Link href={item.href} onClick={() => setOpen(false)}>
        <div
          className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-semibold transition-all
          ${
            isActive
              ? "bg-[#F3E8FF] text-purple-700"
              : "text-gray-500 hover:bg-gray-200"
          }`}
        >
          <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
          {item.name}
        </div>
      </Link>
    )
  }

  return (
    <>
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
        />
      )}
      <aside
        className={`
          z-40 w-72 shrink-0 bg-white border-r border-gray-300
          transition-transform duration-300

          /* MOBILE */
          fixed inset-y-0 left-0
          ${open ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 md:relative md:inset-auto

          /* DESKTOP */
          md:sticky
        `}
        style={{
          top: `calc(${NAVBAR_HEIGHT})`,
          height: `calc(100vh - ${NAVBAR_HEIGHT})`,
        }}
      >
        <div className="flex flex-col gap-3 p-4 overflow-y-auto h-full hover-scrollbar">
          {SECTION_ONE.map((item) => (
            <NavItem key={item.name} item={item} />
          ))}

          <div className="border-t border-gray-300" />
          <button
            onClick={() => setCategoriesOpen(!categoriesOpen)}
            className="flex items-center justify-between text-xs tracking-widest text-gray-500 px-2 mt-3"
          >
            CATEGORIES
            <ChevronDown
              size={16}
              className={`transition ${categoriesOpen ? "rotate-180" : ""}`}
            />
          </button>

          {categoriesOpen && (
            <div className="flex flex-col gap-1 mt-2">
              {CATEGORIES.map((cat) => {
                const isActive = pathname === cat.href
                return (
                  <Link
                    key={cat.name}
                    href={cat.href}
                    onClick={() => setOpen(false)}
                  >
                    <div
                      className={`flex items-center gap-3 px-6 py-2 rounded-lg text-sm transition
                      ${
                        isActive
                          ? "bg-purple-100 text-purple-700"
                          : "text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      <cat.icon size={18} />
                      {cat.name}
                    </div>
                  </Link>
                )
              })}
            </div>
          )}

          <div className="border-t border-gray-300 mt-2" />

          {SECTION_TWO.map((item) => (
            <NavItem key={item.name} item={item} />
          ))}

          <div className="border-t border-gray-300 mt-2" />

          {SECTION_THREE.map((item) => (
            <NavItem key={item.name} item={item} />
          ))}
        </div>
      </aside>
    </>
  )
}
