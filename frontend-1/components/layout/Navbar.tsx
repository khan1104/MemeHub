"use client";

import { useState } from "react";
import UploadModal from "@/components/modals/UploadPostsModal";
import {
  Search,
  Plus,
  Download,
  LogOut,
  Settings,
  CircleUserRound,
  Menu,
  X,
} from "lucide-react";
import { useAuthActions } from "@/hooks/auth";
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";

type NavbarProps = {
  toggleSidebar: () => void;
};

export default function Navbar({ toggleSidebar }: NavbarProps) {
  const router = useRouter();
  const { user, isLoading} = useUser(); // Context se user data le rahe hain
  const isLoggedIn=!!user;
  const {logout}=useAuthActions();
  const [openUpload, setOpenUpload] = useState(false);
  const [openAppModal, setOpenAppModal] = useState(false);
  const [openMenu, setOpenMenu] = useState(false);
  const [mobileSearch, setMobileSearch] = useState(false);
  const userInitial = user?.user_name ? user.user_name.charAt(0).toUpperCase() : "U";
  const handleLogout = async() => {
    setOpenMenu(false);
    const success=await logout();
    if(success) router.replace("/sign-in")
  };
  return (
    <nav className="sticky top-0 left-0 z-50 w-full border-b border-gray-300 bg-white px-4 py-3 sm:px-8">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-6">
        {mobileSearch ? (
          <div className="flex w-full items-center gap-3 md:hidden">
            <input
              autoFocus
              type="text"
              placeholder="Search for memers"
              className="bg-[#F8F9FA] flex-1 rounded-full border border-gray-400 px-4 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-[rgba(114,64,232,0.2)]"
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
            {/* Logo Section */}
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
                className="text-primary flex cursor-pointer items-center gap-1 text-2xl font-black tracking-tighter sm:text-3xl"
              >
                <span>M</span>
                <span className="text-xl text-[#1A1C1E] sm:text-2xl">
                  emeHub
                </span>
              </div>
            </div>

            {/* Search Bar (Desktop) */}
            <div className="relative hidden max-w-2xl flex-1 md:flex">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search for memers"
                className="bg-[#F8F9FA] w-full rounded-full border border-gray-400 py-2.5 pl-12 pr-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-[rgba(114,64,232,0.2)]"
              />
            </div>

            {/* Actions Section */}
            <div className="relative flex items-center gap-3 sm:gap-4">
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
                  {/* Upload Button */}
                  <button
                    type="button"
                    onClick={() => setOpenUpload(true)}
                    className="bg-primary hidden items-center gap-1 rounded-full px-5 py-2.5 text-[15px] font-bold text-white hover:bg-[#6D28D9] sm:flex"
                  >
                    <Plus size={20} />
                    Upload
                  </button>

                  <button
                    type="button"
                    onClick={() => setOpenUpload(true)}
                    className="flex items-center justify-center sm:hidden"
                    aria-label="Upload"
                  >
                    <Plus size={24} />
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={() => setOpenAppModal(true)}
                className="hidden items-center gap-2 rounded-full bg-gray-200 px-4 py-2.5 text-[15px] font-semibold sm:flex"
              >
                <Download size={20} />
                Get App
              </button>

              {/* User Profile / Login Button */}
              {!isLoading && (
                <>
                  {isLoggedIn ? (
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setOpenMenu((p) => !p)}
                        className="bg-primary flex h-11 w-11 items-center justify-center overflow-hidden rounded-full text-sm font-bold text-white border-2 border-transparent hover:border-purple-200 transition-all"
                      >
                        {user?.profile_pic ? (
                          <img
                            src={user.profile_pic}
                            alt={user.user_name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          userInitial
                        )}
                      </button>

                      {openMenu && (
                        <>
                          <div
                            className="fixed inset-0 z-40"
                            onClick={() => setOpenMenu(false)}
                          />
                          <div className="absolute right-0 z-50 mt-2 w-56 rounded-xl border border-gray-100 bg-white py-2 shadow-xl">
                            {/* User Info Header */}
                            <div className="border-b border-gray-50 px-4 py-3">
                              <p className="text-sm font-bold text-gray-900 truncate">
                                {user?.user_name}
                              </p>
                              <p className="text-xs text-gray-500 truncate">
                                {user?.email}
                              </p>
                            </div>

                            <button
                              onClick={() => {
                                setOpenMenu(false);
                                router.push(`/profile/${user?._id}`);
                              }}
                              className="flex w-full items-center gap-2 px-4 py-3 text-sm hover:bg-gray-50 transition-colors"
                            >
                              <CircleUserRound size={16} /> Profile
                            </button>

                            <button
                              onClick={() => {
                                setOpenMenu(false);
                                router.push("/settings");
                              }}
                              className="flex w-full items-center gap-2 px-4 py-3 text-sm hover:bg-gray-50 transition-colors"
                            >
                              <Settings size={16} /> Settings
                            </button>

                            <div className="my-1 border-t border-gray-50" />

                            <button
                              onClick={handleLogout}
                              className="flex w-full items-center gap-2 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                            >
                              <LogOut size={16} /> Logout
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => router.push("/sign-in")}
                      className="bg-primary flex h-10 w-24 items-center justify-center rounded-full text-sm font-bold text-white hover:bg-[#6D28D9] transition-colors"
                    >
                      Log In
                    </button>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </div>

      <UploadModal open={openUpload} onClose={() => setOpenUpload(false)} />

      {/* App Modal */}
      {openAppModal && (
        <div className="z-100 fixed inset-0 flex items-center justify-center px-4">
          <div
            onClick={() => setOpenAppModal(false)}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />
          <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-xl">
            <h2 className="text-xl font-bold text-gray-900">
              🚧 We’re Working On It
            </h2>
            <p className="mt-2 text-gray-600">
              MemeHub mobile app is coming soon. Stay tuned for updates!
            </p>
            <button
              onClick={() => setOpenAppModal(false)}
              className="bg-primary mt-5 rounded-full px-6 py-2 text-sm font-bold text-white hover:bg-[#6D28D9]"
            >
              Got it 👍
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}