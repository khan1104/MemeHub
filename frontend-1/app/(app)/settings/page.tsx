"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { 
  User, Bell, Lock, Trash2, 
  LogOut, ChevronRight, Camera, X 
} from "lucide-react"

export default function Settings() {
  const router = useRouter()
  
  // Modal States
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteInput, setDeleteInput] = useState("")
  
  const USERNAME = "JohnDoe" // Yeh aapke auth logic se aayega
  const expectedDeleteText = `delete+${USERNAME}`

  const handleLogout = () => {
    router.replace("/sign-in")
    // Add your logout logic here
    setShowLogoutModal(false)
  }

  const handleDeleteAccount = () => {
    if (deleteInput === expectedDeleteText) {
      router.replace("/sign-in")
      // Add delete API call here
    }
  }

  return (
    <div className="w-full min-h-screen p-5 bg-slate-50/50">
      <div className="max-w-3xl md:ml-10">
        
        <header className="mb-10 text-center md:text-left">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Settings</h1>
          <p className="text-slate-500 mt-2">Manage your <span className="text-primary">MemeHub</span> account</p>
        </header>

        <div className="space-y-8">
          {/* Account Section */}
          <section>
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3 px-1">My Account</h2>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <SettingItem 
                onClick={() => router.push("/profile")}
                icon={<User size={20} />} 
                title="Profile Information" 
                desc="Update your username and bio" 
              />
              <SettingItem 
                onClick={() => router.push("/profile")}
                icon={<Camera size={20} />} 
                title="Avatar" 
                desc="Change your profile picture" 
              />
            </div>
          </section>
          {/* Notifications */}
            <section>
              <h2 className="text-xs font-bold uppercase tracking-[0.1em] text-slate-400 mb-3 px-1">Notifications</h2>
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <SettingItem 
                  icon={<Bell size={20} />} 
                  title="Notification Settings" 
                  desc="Likes, comments and followers" 
                />
              </div>
            </section>
  
            {/* Security */}
            <section>
              <h2 className="text-xs font-bold uppercase tracking-[0.1em] text-slate-400 mb-3 px-1">Security</h2>
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <SettingItem 
                  icon={<Lock size={20} />} 
                  title="Change Password" 
                  desc="Update your account password" 
                />
              </div>
            </section>

          {/* Danger Zone */}
          <section className="pt-4">
            <div className="bg-red-50/30 rounded-2xl border border-red-100 overflow-hidden">
              <SettingItem 
                onClick={() => setShowLogoutModal(true)}
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

      {/* --- MODALS --- */}

      {/* Logout Confirmation */}
      {showLogoutModal && (
        <Modal onClose={() => setShowLogoutModal(false)} title="Confirm Logout">
          <p className="text-slate-600 mb-6">Are you sure you want to log out of MemeHub?</p>
          <div className="flex gap-3">
            <button onClick={() => setShowLogoutModal(false)} className="flex-1 px-4 py-2.5 rounded-xl bg-slate-100 font-medium">Cancel</button>
            <button onClick={handleLogout} className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white font-medium">Logout</button>
          </div>
        </Modal>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <Modal onClose={() => { setShowDeleteModal(false); setDeleteInput(""); }} title="Delete Account">
          <p className="text-slate-600 mb-4 text-sm">
            This action is permanent. To confirm, please type <span className="font-mono font-bold text-red-600 bg-red-50 px-1">{expectedDeleteText}</span> below.
          </p>
          <input 
            type="text" 
            placeholder={expectedDeleteText}
            className="w-full p-3 rounded-xl border border-slate-200 mb-6 outline-none focus:ring-2 focus:ring-red-500"
            value={deleteInput}
            onChange={(e) => setDeleteInput(e.target.value)}
          />
          <button 
            disabled={deleteInput !== expectedDeleteText}
            onClick={handleDeleteAccount}
            className={`w-full py-3 rounded-xl font-bold transition-all ${
              deleteInput === expectedDeleteText 
              ? "bg-red-600 text-white shadow-lg shadow-red-200" 
              : "bg-slate-100 text-slate-400 cursor-not-allowed"
            }`}
          >
            Delete Permanently
          </button>
        </Modal>
      )}
    </div>
  )
}

// --- SUB-COMPONENTS ---

function SettingItem({ icon, title, desc, danger = false, onClick }: any) {
  return (
    <div
      onClick={onClick}
      className={"group flex items-center justify-between p-5 transition-all active:scale-[0.99] cursor-pointer bg-white hover:bg-slate-50"}
    >
      <div className="flex items-center gap-4">
        <div className={`p-2.5 rounded-xl transition-colors ${
          danger
            ? "bg-red-100/50 text-red-600"
            : "bg-slate-100 text-slate-600 group-hover:bg-purple-500 group-hover:text-white"
        }`}>
          {icon}
        </div>
        <div className="flex flex-col">
          <span className={`font-semibold text-[15px] ${danger ? "text-red-600" : "text-slate-800"}`}>
            {title}
          </span>
          <span className="text-[13px] text-slate-500 line-clamp-1">
            {desc}
          </span>
        </div>
      </div>
      <ChevronRight size={16} className={`transition-transform group-hover:translate-x-0.5 ${danger ? "text-red-300" : "text-slate-300"}`} />
    </div>
  )
}

function Modal({ children, title, onClose }: any) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-slate-900">{title}</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full transition-colors">
            <X size={20} className="text-slate-400" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}