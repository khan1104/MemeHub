"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Bell,
  Lock,
  Trash2,
  LogOut,
  ChevronRight,
  Camera,
  X,
  Pencil
} from "lucide-react";
import { useUser } from "@/context/UserContext";
import { useAuthActions } from "@/hooks/auth";
import { useUsers } from "@/hooks/user";

export default function Settings() {
  const router = useRouter();

  const { user,loadUser } = useUser();
  const { logout } = useAuthActions();
  const { updateUserInfo ,loading,error} = useUsers();

  // ===== STATES =====
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");

  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showChangeNameModal, setShowChangeNameModal] = useState(false);
  const [showChangeBioModal, setShowChangeBioModal] = useState(false);

  const [newName, setNewName] = useState(user?.user_name || "");
  const [newBio, setNewBio] = useState(user?.bio || "");

  const USERNAME = user?.user_name;
  const expectedDeleteText = `delete+${USERNAME}`;

  const handleLogout = async () => {
    const success = await logout();
    if (success) router.replace("/sign-in");
  };

  const handleDeleteAccount = () => {
    if (deleteInput === expectedDeleteText) {
      router.replace("/sign-in");
    }
  };

  const handleChangeName = async () => {
    const res = await updateUserInfo(newName, undefined);
    setShowChangeNameModal(false);
    if (res) await loadUser();
  };

  const handleChangeBio = async () => {
    const res = await updateUserInfo(undefined, newBio);
    setShowChangeBioModal(false);
    if (res) await loadUser();
  };

  return (
    <div className="w-full min-h-screen p-5 bg-slate-50/50">
      <div className="max-w-3xl md:ml-10">
        {/* HEADER */}
        <header className="mb-10 text-center md:text-left">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Settings
          </h1>
          <p className="text-slate-500 mt-2">
            Manage your <span className="text-primary">MemeHub</span> account
          </p>
        </header>

        <div className="space-y-8">
          {/* ACCOUNT */}
          <section>
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3 px-1">
              My Account
            </h2>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              {/* PROFILE INFO DROPDOWN */}
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
                    className={`text-slate-400 transition-transform ${
                      showProfileDropdown ? "rotate-90" : ""
                    }`}
                  />
                </div>

                {showProfileDropdown && (
                  <div className="pl-16 pr-5 pb-4 space-y-2">
                    <div
                      onClick={() => setShowChangeNameModal(true)}
                      className="flex items-center justify-between px-4 py-2.5 rounded-xl cursor-pointer
               hover:bg-slate-100 transition"
                    >
                      <div className="flex items-center gap-3">
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
                    </div>

                    <div
                      onClick={() => setShowChangeBioModal(true)}
                      className="flex items-center justify-between px-4 py-2.5 rounded-xl cursor-pointer
               hover:bg-slate-100 transition"
                    >
                      <div className="flex items-center gap-3">
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
                    </div>
                  </div>
                )}
              </div>

              {/* AVATAR */}
              <SettingItem
                onClick={() => router.push(`/profile/${user?._id}`)}
                icon={<Camera size={20} />}
                title="Avatar"
                desc="Change your profile picture"
              />
            </div>
          </section>

          {/* NOTIFICATIONS */}
          <section>
            <h2 className="text-xs font-bold uppercase tracking-[0.1em] text-slate-400 mb-3 px-1">
              Notifications
            </h2>
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <SettingItem
                icon={<Bell size={20} />}
                title="Notification Settings"
                desc="Likes, comments and followers"
              />
            </div>
          </section>

          {/* SECURITY */}
          <section>
            <h2 className="text-xs font-bold uppercase tracking-[0.1em] text-slate-400 mb-3 px-1">
              Security
            </h2>
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <SettingItem
                icon={<Lock size={20} />}
                title="Change Password"
                desc="Update your account password"
              />
            </div>
          </section>

          {/* DANGER */}
          <section className="pt-4">
            <div className="bg-red-50/30 rounded-2xl border border-red-100 overflow-hidden">
              <SettingItem
                onClick={handleLogout}
                icon={<LogOut size={20} className="text-red-600" />}
                title="Logout"
                desc="Sign out of your account"
                danger
              />
              <SettingItem
                onClick={() => setShowDeleteModal(true)}
                icon={<Trash2 size={20} className="text-red-600" />}
                title="Delete Account"
                desc="Permanently delete your account and memes"
                danger
              />
            </div>
          </section>
        </div>
      </div>

      {/* ===== MODALS ===== */}

      {/* CHANGE NAME */}
      {showChangeNameModal && (
        <Modal
          title="Change Username"
          onClose={() => setShowChangeNameModal(false)}
        >
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="w-full p-3 rounded-xl border mb-4 outline-none focus:border-primary focus:ring-2 focus:ring-[rgba(114,64,232,0.2)]"
            placeholder="Enter new username"
          />
          <button
            className="w-full py-3 rounded-xl bg-primary text-white font-bold"
            onClick={handleChangeName}
          >
            Save Changes
          </button>
        </Modal>
      )}

      {/* CHANGE BIO */}
      {showChangeBioModal && (
        <Modal title="Change Bio" onClose={() => setShowChangeBioModal(false)}>
          <textarea
            value={newBio}
            onChange={(e) => setNewBio(e.target.value)}
            rows={2}
            className="w-full p-3 rounded-xl border mb-4 outline-none focus:border-primary focus:ring-2 focus:ring-[rgba(114,64,232,0.2)]"
            placeholder="Write your bio..."
          />
          <button
            className="w-full py-3 rounded-xl bg-primary text-white font-bold"
            onClick={handleChangeBio}
          >
            Save Changes
          </button>
        </Modal>
      )}

      {/* DELETE ACCOUNT */}
      {showDeleteModal && (
        <Modal
          title="Delete Account"
          onClose={() => {
            setShowDeleteModal(false);
            setDeleteInput("");
          }}
        >
          <p className="text-slate-600 mb-4 text-sm">
            Type{" "}
            <span className="font-mono font-bold text-red-600 bg-red-50 px-1">
              {expectedDeleteText}
            </span>{" "}
            to confirm.
          </p>
          <input
            className="w-full p-3 rounded-xl border mb-6"
            value={deleteInput}
            onChange={(e) => setDeleteInput(e.target.value)}
          />
          <button
            disabled={deleteInput !== expectedDeleteText}
            onClick={handleDeleteAccount}
            className={`w-full py-3 rounded-xl font-bold ${
              deleteInput === expectedDeleteText
                ? "bg-red-600 text-white"
                : "bg-slate-100 text-slate-400"
            }`}
          >
            Delete Permanently
          </button>
        </Modal>
      )}
    </div>
  );
}

/* ===== SUB COMPONENTS ===== */

function SettingItem({ icon, title, desc, danger = false, onClick }: any) {
  return (
    <div
      onClick={onClick}
      className="group flex items-center justify-between p-5 cursor-pointer hover:bg-slate-50"
    >
      <div className="flex items-center gap-4">
        <div
          className={`p-2.5 rounded-xl ${
            danger
              ? "bg-red-100/50 text-red-600"
              : "bg-slate-100 text-slate-600 group-hover:bg-purple-500 group-hover:text-white"
          }`}
        >
          {icon}
        </div>
        <div>
          <span
            className={`font-semibold text-[15px] ${
              danger ? "text-red-600" : "text-slate-800"
            }`}
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

function Modal({ children, title, onClose }: any) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white w-full max-w-md rounded-3xl p-6">
        <div className="flex justify-between mb-4">
          <h3 className="text-xl font-bold">{title}</h3>
          <button onClick={onClose}>
            <X />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
