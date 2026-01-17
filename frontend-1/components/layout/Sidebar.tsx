"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { ChevronDown, LucideIcon } from "lucide-react"
import { useUser } from "@/context/UserContext"
import { SECTION_ONE, SECTION_TWO, SECTION_THREE, CATEGORIES } from "@/data/Sidebar"

// --- Types ---
type NavItemData = {
  name: string
  href: string
  icon: LucideIcon | any // Supports Lucide or React-icons
}

type SidebarProps = {
  open: boolean
  setOpen: (value: boolean) => void
}

const NAVBAR_HEIGHT = "64px"

// --- Sub-component for Navigation Items ---
const NavItem = ({ 
  item, 
  user, 
  pathname, 
  setOpen 
}: { 
  item: NavItemData; 
  user: any; 
  pathname: string; 
  setOpen: (v: boolean) => void 
}) => {
  // Fix: Don't mutate the original object. Create a dynamic link.
  const dynamicHref = item.href === "/profile" ? `/profile/${user?._id}` : item.href
  const isActive = pathname === dynamicHref

  return (
    <Link href={dynamicHref} onClick={() => setOpen(false)}>
      <div
        className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-semibold transition-all
        ${
          isActive
            ? "bg-purple-100 text-purple-700"
            : "text-gray-500 hover:bg-gray-100"
        }`}
      >
        <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
        <span className="truncate">{item.name}</span>
      </div>
    </Link>
  )
}

export default function Sidebar({ open, setOpen }: SidebarProps) {
  const pathname = usePathname()
  const { user,loading } = useUser()
  const [categoriesOpen, setCategoriesOpen] = useState(true)
  if (loading) return null;

  return (
    <>
      {/* Mobile Overlay: Only visible when open on mobile */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
        />
      )}

      <aside
        className={`
          z-40 w-72 shrink-0 bg-white border-r border-gray-200
          transition-transform duration-300 ease-in-out
          
          /* Mobile: Sliding from left */
          fixed inset-y-0 left-0
          ${open ? "translate-x-0" : "-translate-x-full"}
          
          /* Desktop: Normal flow */
          md:translate-x-0 md:relative md:inset-auto md:sticky
        `}
        style={{
          top: NAVBAR_HEIGHT,
          height: `calc(100vh - ${NAVBAR_HEIGHT})`,
        }}
      >
        <div className="flex flex-col gap-2 p-4 overflow-y-auto h-full hover-scrollbar">
          
          {/* Section 1: Main Links */}
          <div className="flex flex-col gap-1">
            {SECTION_ONE.map((item) => (
              <NavItem key={item.name} item={item} user={user} pathname={pathname} setOpen={setOpen} />
            ))}
          </div>

          <div className="border-t border-gray-200 my-2" />

          {/* Categories Section */}
          <button
            onClick={() => setCategoriesOpen(!categoriesOpen)}
            className="flex items-center justify-between text-[11px] font-bold tracking-widest text-gray-400 px-2 uppercase"
          >
            Categories
            <ChevronDown
              size={14}
              className={`transition-transform duration-200 ${categoriesOpen ? "rotate-180" : ""}`}
            />
          </button>

          {categoriesOpen && (
            <div className="flex flex-col gap-1 mt-1">
              {CATEGORIES.map((cat) => (
                <NavItem key={cat.name} item={cat} user={user} pathname={pathname} setOpen={setOpen} />
              ))}
            </div>
          )}

          <div className="border-t border-gray-200 my-2" />

          {/* Section 2: Personal/Social */}
          <div className="flex flex-col gap-1">
            {SECTION_TWO.map((item) => (
              <NavItem key={item.name} item={item} user={user} pathname={pathname} setOpen={setOpen} />
            ))}
          </div>

          <div className="border-t border-gray-200 my-2" />

          {/* Section 3: Legal/Support */}
          <div className="flex flex-col gap-1">
            {SECTION_THREE.map((item) => (
              <NavItem key={item.name} item={item} user={user} pathname={pathname} setOpen={setOpen} />
            ))}
          </div>
          
        </div>
      </aside>
    </>
  )
}