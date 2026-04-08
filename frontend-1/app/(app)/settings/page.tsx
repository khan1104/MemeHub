"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  LogOut,
  ChevronRight,
  Camera,
  X,
  Pencil,
  Loader2, 
} from "lucide-react";
import { useUser } from "@/context/UserContext";
import { useAuth } from "@/hooks/auth";
import { useUsers } from "@/hooks/user";
import { toast } from "sonner";

export default function Settings() {
  const router = useRouter();
  const { user, loadUser } = useUser();
  const { logout ,error:logoutError} = useAuth();
  const { updateUserInfo, loading, error } = useUsers();

  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showChangeNameModal, setShowChangeNameModal] = useState(false);
  const [showChangeBioModal, setShowChangeBioModal] = useState(false);

  const [newName, setNewName] = useState("");
  const [newBio, setNewBio] = useState("");

  useEffect(() => {
    if (showChangeNameModal) setNewName(user?.user_name || "");
    if (showChangeBioModal) setNewBio(user?.bio || "");
  }, [showChangeNameModal, showChangeBioModal, user]);

  // Error handling
  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  useEffect(() => {
    if (logoutError) toast.error(logoutError);
  }, [logoutError]);

  const handleLogout = async () => {
    const success = await logout();
    if (success) {
      toast.success("Logged out successfully");
      router.replace("/sign-in");
    }
  };

  const handleChangeName = async () => {
    if (!newName.trim() || newName === user?.user_name) {
      setShowChangeNameModal(false);
      return;
    }

    const res = await updateUserInfo(newName, undefined);
    if (res) {
      await loadUser();
      toast.success("Username updated!");
      setShowChangeNameModal(false);
    }
  };

  const handleChangeBio = async () => {
    if (newBio === user?.bio) {
      setShowChangeBioModal(false);
      return;
    }

    const res = await updateUserInfo(undefined, newBio);
    if (res) {
      await loadUser();
      toast.success("Bio updated!");
      setShowChangeBioModal(false);
    }
  };

  return (
    <div className="w-full min-h-screen p-5 bg-slate-50/50">
      <div className="max-w-3xl md:ml-10">
        <header className="mb-10 text-center md:text-left">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Settings
          </h1>
          <p className="text-slate-500 mt-2">
            Manage your <span className="text-primary">MemeHub</span> account
          </p>
        </header>

        <div className="space-y-8">
          {/* ACCOUNT SECTION */}
          <section>
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3 px-1">
              My Account
            </h2>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="border-b border-slate-100">
                <div
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="group flex items-center justify-between p-5 cursor-pointer hover:bg-slate-50"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 rounded-xl bg-slate-100 text-slate-600 group-hover:bg-purple-500 group-hover:text-white">
                      <User size={20} />
                    </div>
                    <div>
                      <span className="font-semibold text-[15px] text-slate-800">
                        Profile Information
                      </span>
                      <p className="text-[13px] text-slate-500">
                        Update your username and bio
                      </p>
                    </div>
                  </div>
                  <ChevronRight
                    size={16}
                    className={`text-slate-400 transition-transform ${showProfileDropdown ? "rotate-90" : ""}`}
                  />
                </div>

                {showProfileDropdown && (
                  <div className="pl-16 pr-5 pb-4 space-y-2">
                    <button
                      disabled={loading}
                      onClick={() => setShowChangeNameModal(true)}
                      className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl hover:bg-slate-100 transition disabled:opacity-50"
                    >
                      <div className="flex items-center gap-3 text-left">
                        <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                          <Pencil size={14} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-slate-800">
                            Change Name
                          </span>
                          <span className="text-xs text-slate-500">
                            Update your display name
                          </span>
                        </div>
                      </div>
                      <ChevronRight size={14} className="text-slate-400" />
                    </button>

                    <button
                      disabled={loading}
                      onClick={() => setShowChangeBioModal(true)}
                      className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl hover:bg-slate-100 transition disabled:opacity-50"
                    >
                      <div className="flex items-center gap-3 text-left">
                        <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                          <Pencil size={14} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-slate-800">
                            Change Bio
                          </span>
                          <span className="text-xs text-slate-500">
                            Edit your profile bio
                          </span>
                        </div>
                      </div>
                      <ChevronRight size={14} className="text-slate-400" />
                    </button>
                  </div>
                )}
              </div>

              <SettingItem
                onClick={() => router.push(`/profile/${user?.user_id}`)}
                icon={<Camera size={20} />}
                title="Avatar"
                desc="Change your profile picture"
              />
            </div>
          </section>

          {/* DANGER ZONE */}
          <section className="pt-4">
            <div className="bg-red-50/30 rounded-2xl border border-red-100 overflow-hidden">
              <SettingItem
                onClick={handleLogout}
                icon={<LogOut size={20} className="text-red-600" />}
                title="Logout"
                desc="Sign out of your account"
                danger
              />
            </div>
          </section>
        </div>
      </div>

      {/* MODALS */}
      {showChangeNameModal && (
        <Modal
          title="Change Username"
          onClose={() => setShowChangeNameModal(false)}
        >
          <input
            disabled={loading}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="w-full p-3 rounded-xl border mb-4 outline-none focus:border-primary focus:ring-2 focus:ring-purple-100 disabled:bg-slate-50"
            placeholder="Enter new username"
          />
          <button
            disabled={loading || !newName.trim()}
            className="w-full py-3 rounded-xl bg-primary text-white font-bold flex items-center justify-center gap-2 hover:opacity-90 transition disabled:opacity-70"
            onClick={handleChangeName}
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              "Save Changes"
            )}
          </button>
        </Modal>
      )}

      {showChangeBioModal && (
        <Modal title="Change Bio" onClose={() => setShowChangeBioModal(false)}>
          <textarea
            disabled={loading}
            value={newBio}
            onChange={(e) => setNewBio(e.target.value)}
            rows={3}
            className="w-full p-3 rounded-xl border mb-4 outline-none focus:border-primary focus:ring-2 focus:ring-purple-100 disabled:bg-slate-50"
            placeholder="Write your bio..."
          />
          <button
            disabled={loading}
            className="w-full py-3 rounded-xl bg-primary text-white font-bold flex items-center justify-center gap-2 hover:opacity-90 transition disabled:opacity-70"
            onClick={handleChangeBio}
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              "Save Changes"
            )}
          </button>
        </Modal>
      )}
    </div>
  );
}
interface SettingItemProps {
  icon: React.ReactNode;
  title: string;
  desc: string;
  danger?: boolean;
  onClick?: () => void;
}
// Sub-components as they were, but with slight accessibility tweaks
function SettingItem({ icon, title, desc, danger = false, onClick }: SettingItemProps) {
  return (
    <div
      onClick={onClick}
      className="group flex items-center justify-between p-5 cursor-pointer hover:bg-slate-50 transition-colors"
    >
      <div className="flex items-center gap-4">
        <div
          className={`p-2.5 rounded-xl ${danger ? "bg-red-100 text-red-600" : "bg-slate-100 text-slate-600 group-hover:bg-purple-500 group-hover:text-white"}`}
        >
          {icon}
        </div>
        <div>
          <span
            className={`font-semibold text-[15px] ${danger ? "text-red-600" : "text-slate-800"}`}
          >
            {title}
          </span>
          <p className="text-[13px] text-slate-500">{desc}</p>
        </div>
      </div>
      <ChevronRight size={16} className="text-slate-300" />
    </div>
  );
}

interface ModalProps {
  children: React.ReactNode;
  title: string;
  onClose: () => void;
}

function Modal({ children, title, onClose }: ModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-slate-900">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
