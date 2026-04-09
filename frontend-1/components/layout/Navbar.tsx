"use client";

import { useState, useEffect, useRef } from "react";
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
import { useAuth } from "@/hooks/auth";
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";
import { useUsers } from "@/hooks/user";
import { toast } from "sonner";
import { SearchUsers } from "@/types/user.type";
const useDebounce = (value: string, delay: number = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

type NavbarProps = {
  toggleSidebar: () => void;
};

export default function Navbar({ toggleSidebar }: NavbarProps) {
  const router = useRouter();
  const { user, isLoading } = useUser();
  const isLoggedIn = !!user;
  const { logout,loading:authLogin,error:authError } = useAuth();
  const [openUpload, setOpenUpload] = useState(false);
  const [openAppModal, setOpenAppModal] = useState(false);
  const [openMenu, setOpenMenu] = useState(false);
  const [mobileSearch, setMobileSearch] = useState(false);
  const [query, setQuery] = useState("");
  const {
    SearchUsers,
    loading: searchLaoding,
    error: searchError,
  } = useUsers();
  const [users, setUsers] = useState<SearchUsers[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const debouncedQuery = useDebounce(query, 500);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const userInitial = user?.user_name
    ? user.user_name.charAt(0).toUpperCase()
    : "U";

  const handleLogout = async () => {
    setOpenMenu(false);
    const success = await logout();
    if (success) router.replace("/sign-in");
  };

  

 useEffect(() => {
   const fetchUsers = async () => {
     if (!debouncedQuery.trim() || debouncedQuery.length < 2) {
       setUsers([]);
       setShowDropdown(false);
       return;
     }

     ;
     setShowDropdown(true);

     const res = await SearchUsers(debouncedQuery);
     if (res) setUsers(res);

     
   };

   fetchUsers();
 }, [debouncedQuery]);

 useEffect(() => {
   setSelectedIndex(-1);
 }, [users]);

  useEffect(() => {
    const handleClickOutside = (e: any) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!users.length) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < users.length - 1 ? prev + 1 : 0));
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : users.length - 1));
    }

    if (e.key === "Enter") {
      if (selectedIndex >= 0) {
        const selectedUser = users[selectedIndex];
        router.push(`/profile/${selectedUser._id}`);
        setShowDropdown(false);
        setQuery("");
      }
    }
  };

  useEffect(() => {
    if (authError) alert(authError);
  }, [authError]);

  useEffect(() => {
    if (searchError) toast.error(searchError);
  }, [searchError]);

  return (
    <nav className="sticky top-0 left-0 z-50 w-full border-b border-gray-300 bg-white px-4 py-3 sm:px-8">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-6">
        {mobileSearch ? (
          <div className="w-full md:hidden relative" ref={dropdownRef}>
            <div className="flex items-center gap-3">
              <input
                autoFocus
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                maxLength={15}
                placeholder="Search users..."
                className="bg-[#F8F9FA] flex-1 rounded-full border border-gray-400 px-4 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-[rgba(114,64,232,0.2)]"
              />
              <button onClick={() => setMobileSearch(false)}>
                <X size={24} />
              </button>
            </div>

            {showDropdown && query && (
              <div className="absolute top-full left-0 w-80 bg-white border rounded-2xl mt-0.5 shadow-lg z-50 max-h-60 overflow-y-auto">
                {searchLaoding ? (
                  <p className="p-3 text-gray-500">Searching...</p>
                ) : users.length > 0 ? (
                  users.map((u) => (
                    <div
                      key={u._id}
                      onClick={() => {
                        setUsers([]);
                        setQuery("");
                        router.push(`/profile/${u._id}`);
                      }}
                      className="flex items-center gap-3 p-3 hover:bg-gray-100"
                    >
                      <img
                        src={u.profile_pic || "/default.png"}
                        className="w-8 h-8 rounded-full"
                      />
                      <span>{u.user_name}</span>
                    </div>
                  ))
                ) : (
                  <p className="p-3 text-gray-500">No users found</p>
                )}
              </div>
            )}
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
                  eemHub
                </span>
              </div>
            </div>

            {/* Search Bar (Desktop) */}
            <div
              className="relative hidden max-w-2xl flex-1 md:flex"
              ref={dropdownRef}
            >
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

              <input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setShowDropdown(true);
                }}
                onKeyDown={handleKeyDown}
                maxLength={15}
                placeholder="Search users..."
                className="bg-[#F8F9FA] w-full rounded-full border border-gray-400 py-2.5 pl-12 pr-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-[rgba(114,64,232,0.2)]"
              />

              {showDropdown && query && (
                <div className="absolute top-full left-0 w-full bg-white border rounded-2xl mt-0.5 shadow-lg z-50 max-h-60 overflow-y-auto">
                  {searchLaoding ? (
                    <p className="p-3 text-gray-500">Searching...</p>
                  ) : users.length > 0 ? (
                    users.map((u, index) => (
                      <div
                        key={u._id}
                        onClick={() => {
                          setUsers([]);
                          setQuery("");
                          setShowDropdown(false);
                          router.push(`/profile/${u._id}`);
                        }}
                        className={`flex items-center gap-3 p-3 cursor-pointer ${
                          index === selectedIndex
                            ? "bg-gray-200"
                            : "hover:bg-gray-100"
                        }`}
                      >
                        <img
                          src={u.profile_pic || "/default.png"}
                          className="w-8 h-8 rounded-full"
                        />
                        <span>{u.user_name}</span>
                      </div>
                    ))
                  ) : (
                    <p className="p-3 text-gray-500">No users found</p>
                  )}
                </div>
              )}
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
                  <button
                    type="button"
                    onClick={() => setOpenUpload(true)}
                    className="bg-primary hidden items-center gap-1 rounded-full px-5 py-2.5 text-[15px] font-bold text-white hover:bg-[#6D28D9] sm:flex cursor-pointer"
                  >
                    <Plus size={20} />
                    Upload
                  </button>

                  <button
                    type="button"
                    onClick={() => setOpenUpload(true)}
                    className="flex items-center justify-center sm:hidden cursor-pointer"
                    aria-label="Upload"
                  >
                    <Plus size={24} />
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={() => setOpenAppModal(true)}
                className="hidden items-center gap-2 rounded-full bg-gray-200 px-4 py-2.5 text-[15px] font-semibold sm:flex cursor-pointer"
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
                        className="bg-primary flex h-11 w-11 items-center justify-center overflow-hidden rounded-full text-sm font-bold text-white border-2 border-transparent hover:border-purple-200 transition-all cursor-pointer"
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
                                router.push(`/profile/${user?.user_id}`);
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
              MeemHub mobile app is coming soon. Stay tuned for updates!
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


