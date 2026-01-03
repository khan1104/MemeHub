"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import UploadModal from "@/components/UploadPosts";
import {
  Search,
  Plus,
  Download,
  LogOut,
  Settings,
  CircleUserRound,
  Menu,
  X
} from "lucide-react"

type NavbarProps = {
  toggleSidebar: () => void
}

export default function Navbar({ toggleSidebar }: NavbarProps) {
  const router = useRouter()
  const [openUpload, setOpenUpload] = useState(false)
  const isLoggedIn = true
  const username = "JD"
  const [openAppModal, setOpenAppModal] = useState(false)
  const [openMenu, setOpenMenu] = useState(false)
  const [mobileSearch, setMobileSearch] = useState(false)

  const menuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenu(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const handleLogout = () => {
    setOpenMenu(false)
    router.push("/sign-in")
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-300 bg-white px-4 sm:px-8 py-3">
      <div className="mx-auto flex max-w-360 items-center justify-between gap-6">

        {mobileSearch ? (
          <div className="flex w-full items-center gap-3 md:hidden">
            <input
              autoFocus
              type="text"
              placeholder="Search for memers"
              className="flex-1 rounded-full border border-gray-400 px-4 py-2 text-sm outline-none bg-[#F8F9FA]
              focus:border-primary focus:ring-2 focus:ring-[rgba(114,64,232,0.2)]"
            />
            <button
              type="button"
              aria-label="Close search"
              onClick={() => setMobileSearch(false)}
            >
              <X size={24} />
            </button>
          </div>
        ) : (
          <>

            <div className="flex items-center gap-3">
              <button
                type="button"
                aria-label="Open sidebar"
                onClick={toggleSidebar}
                className="md:hidden"
              >
                <Menu size={26} />
              </button>
              <div
                onClick={() => router.push("/")}
                className="flex cursor-pointer items-center gap-1 font-black tracking-tighter text-primary text-2xl sm:text-3xl"
              >
                <span>M</span>
                <span className="text-[#1A1C1E] text-xl sm:text-2xl">
                  emeHub
                </span>
              </div>
            </div>

            <div className="relative hidden md:flex flex-1 max-w-2xl">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search for memers"
                className="w-full rounded-full border border-gray-400 py-2.5 pl-12 pr-4 text-sm outline-none bg-[#F8F9FA]
                focus:border-primary focus:ring-2 focus:ring-[rgba(114,64,232,0.2)]"
              />
            </div>
            <div className="flex items-center gap-3 sm:gap-4 relative">
              <button
                type="button"
                aria-label="Search"
                onClick={() => setMobileSearch(true)}
                className="md:hidden"
              >
                <Search size={22} />
              </button>
              {isLoggedIn && (
                <>
                {/* Upload (Desktop Button) */}
                <button
                  type="button"
                  onClick={() => setOpenUpload(true)}
                  className="hidden sm:flex items-center gap-1 rounded-full bg-primary px-5 py-2.5 text-[15px] font-bold text-white hover:bg-[#6D28D9]"
                >
                  <Plus size={20} />
                  Upload
                </button>

                {/* Upload (Mobile Icon) */}
                <button
                  type="button"
                  onClick={() => setOpenUpload(true)}
                  className="sm:hidden flex items-center justify-center"
                  aria-label="Upload"
                >
                  <Plus size={24} />
                </button>

                </>
              )}
              <button
                type="button"
                onClick={() => setOpenAppModal(true)}
                className="hidden sm:flex items-center gap-2 rounded-full bg-gray-200 px-4 py-2.5 text-[15px] font-semibold"
              >
                <Download size={20} />
                Get App
              </button>
              {isLoggedIn ? (
                <div ref={menuRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setOpenMenu((p) => !p)}
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-sm font-bold text-white"
                  >
                    {username}
                  </button>

                  {openMenu && (
                    <div className="absolute right-0 mt-2 w-44 rounded-xl bg-white shadow-lg overflow-hidden">
                      <button
                        type="button"
                        onClick={() => router.push("/profile")}
                        className="flex w-full items-center gap-2 px-4 py-3 text-sm hover:bg-gray-100"
                      >
                        <CircleUserRound size={16} /> Profile
                      </button>

                      <button
                        type="button"
                        onClick={() => router.push("/settings")}
                        className="flex w-full items-center gap-2 px-4 py-3 text-sm hover:bg-gray-100"
                      >
                        <Settings size={16} /> Settings
                      </button>

                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-gray-100"
                      >
                        <LogOut size={16} /> Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => router.push("/sign-in")}
                  className="flex h-10 w-24 items-center justify-center rounded-full bg-primary text-sm font-bold text-white"
                >
                  Log In
                </button>
              )}
            </div>
          </>
        )}
      </div>
      <UploadModal
        open={openUpload}
        onClose={() => setOpenUpload(false)}
      />
      {openAppModal && (
      <div className="fixed inset-0 z-100 flex items-center justify-center px-4">
        {/* Overlay */}
        <div
          onClick={() => setOpenAppModal(false)}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />

        {/* Modal */}
        <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-xl">
          <h2 className="text-xl font-bold text-gray-900">
            🚧 We’re Working On It
          </h2>
          <p className="mt-2 text-gray-600">
            MemeHub mobile app is coming soon.
            Stay tuned for updates!
          </p>

          <button
            onClick={() => setOpenAppModal(false)}
            className="mt-5 rounded-full bg-primary px-6 py-2 text-sm font-bold text-white hover:bg-[#6D28D9]"
          >
            Got it 👍
          </button>
        </div>
      </div>
    )}
    </nav>
  )
}
