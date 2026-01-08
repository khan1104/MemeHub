"use client"

import Image from "next/image"
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react"
import { Send, Smile } from "lucide-react"
import EmojiPicker from "emoji-picker-react"

const friends = [
  {
    id: "1",
    name: "John Doe",
    avatar:
      "https://terpdfhqqmambcxoyrxn.supabase.co/storage/v1/object/public/profile_pics/default_profile_pics/default_pic.png",
    online: true,
    lastSeen: "Online",
  },
  {
    id: "2",
    name: "Sarah Khan",
    avatar:
      "https://terpdfhqqmambcxoyrxn.supabase.co/storage/v1/object/public/profile_pics/default_profile_pics/default_pic.png",
    online: false,
    lastSeen: "Last seen 2h ago",
  },
  {
    id: "3",
    name: "Khan",
    avatar:
      "https://terpdfhqqmambcxoyrxn.supabase.co/storage/v1/object/public/profile_pics/default_profile_pics/default_pic.png",
    online: false,
    lastSeen: "Last seen 2h ago",
  },
  {
    id: "4",
    name: "Aman",
    avatar:
      "https://terpdfhqqmambcxoyrxn.supabase.co/storage/v1/object/public/profile_pics/default_profile_pics/default_pic.png",
    online: false,
    lastSeen: "Last seen 2h ago",
  },
  {
    id: "5",
    name: "Irfan",
    avatar:
      "https://terpdfhqqmambcxoyrxn.supabase.co/storage/v1/object/public/profile_pics/default_profile_pics/default_pic.png",
    online: false,
    lastSeen: "Last seen 2h ago",
  },
  {
    id: "6",
    name: "sahil",
    avatar:
      "https://terpdfhqqmambcxoyrxn.supabase.co/storage/v1/object/public/profile_pics/default_profile_pics/default_pic.png",
    online: false,
    lastSeen: "Last seen 2h ago",
  },
  {
    id: "7",
    name: "umar",
    avatar:
      "https://terpdfhqqmambcxoyrxn.supabase.co/storage/v1/object/public/profile_pics/default_profile_pics/default_pic.png",
    online: false,
    lastSeen: "Last seen 2h ago",
  },
  {
    id: "8",
    name: "Legend",
    avatar:
      "https://terpdfhqqmambcxoyrxn.supabase.co/storage/v1/object/public/profile_pics/default_profile_pics/default_pic.png",
    online: false,
    lastSeen: "Last seen 2h ago",
  },
  {
    id: "9",
    name: "Zoya",
    avatar:
      "https://terpdfhqqmambcxoyrxn.supabase.co/storage/v1/object/public/profile_pics/default_profile_pics/default_pic.png",
    online: false,
    lastSeen: "Last seen 2h ago",
  },
]

export default function FriendsPage() {
  const router=useRouter();
  const [showEmoji, setShowEmoji] = useState(false)
  const [activeFriend, setActiveFriend] = useState<any>(null)
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<any[]>([
    { text: "Hey 😂", sender: "friend", time: "10:00 AM" },
    { text: "That meme was crazy", sender: "friend", time: "10:01 AM" },
    { text: "Haha thanks 😎", sender: "me", time: "10:05 AM" },
  ])
  const [search, setSearch] = useState("")
  const [showFriends, setShowFriends] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
  if (!activeFriend && friends.length > 0) {
    setActiveFriend(friends[0])
  }
}, [])

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    })
  }, [messages])

  const sendMessage = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!message.trim()) return

    const now = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })

    setMessages([...messages, { text: message, sender: "me", time: now }])
    setMessage("")
  }
  
  const filteredFriends = friends.filter(friend =>
  friend.name.toLowerCase().includes(search.toLowerCase())
)

  return (
    <div className="relative flex h-[85vh] rounded-2xl border border-slate-200 overflow-hidden">

      {/* OVERLAY (Mobile Only) */}
      {showFriends && (
        <div
          onClick={() => setShowFriends(false)}
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
        />
      )}

      {/* FRIENDS LIST */}
      <aside
          className={`
            bg-white border-r border-slate-200 flex flex-col
            w-[320px]

            fixed left-0 top-16 bottom-0 z-40
            transition-transform duration-300
            ${showFriends ? "translate-x-0" : "-translate-x-full"}

            md:relative md:top-0 md:bottom-0 md:translate-x-0 md:flex
          `}
        >
        <div className="p-4 border-b border-slate-200">
          <input
            placeholder="Search friends..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mt-2 w-full bg-slate-100 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="flex-1 overflow-y-auto hover-scrollbar">
          {filteredFriends.map(friend => (
            <div
              key={friend.id}
              onClick={() => {
                setActiveFriend(friend)
                setShowFriends(false)
              }}
              className={`flex items-center gap-4 px-4 py-3 cursor-pointer border-b border-slate-100 transition ${
                activeFriend?.id === friend.id
                  ? "bg-purple-100"
                  : "hover:bg-gray-200"
              }`}
            >
              <div className="relative">
                <Image
                  src={friend.avatar}
                  alt={friend.name}
                  width={45}
                  height={45}
                  className="rounded-full"
                />
                {friend.online && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                )}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-slate-800">{friend.name}</p>
                <p className="text-xs text-slate-500 truncate">
                  Tap to start chatting...
                </p>
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* CHAT AREA */}
      <section className="flex-1 flex flex-col bg-[#F8F9FD]">

        {!activeFriend ? (
          <div className="flex-1 flex items-center justify-center text-slate-400">
            Select a conversation
          </div>
        ) : (
          <>
            {/* CHAT HEADER */}
            <header className="p-4 border-b border-slate-200 bg-white flex items-center gap-3">

              {/* Mobile Menu Button */}
              <button
                onClick={() => setShowFriends(true)}
                className="md:hidden p-2 rounded-lg border border-slate-200"
              >
                ☰
              </button>
              
              <Image
                src={activeFriend.avatar}
                alt={activeFriend.name}
                width={40}
                height={40}
                className="rounded-full"
                onClick={()=>{router.push(`/profile/${activeFriend.id}`)}}
              />

              <div>
                <p className="font-bold text-slate-800">{activeFriend.name}</p>
                <span className="text-xs text-green-500">
                  {activeFriend.lastSeen}
                </span>
              </div>
            </header>

            {/* MESSAGES */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 space-y-4 border-b border-slate-200"
            >
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${
                    msg.sender === "me" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div className="max-w-[70%]">
                    <div
                      className={`px-4 py-2 rounded-xl text-sm ${
                        msg.sender === "me"
                          ? "bg-primary text-white"
                          : "bg-white border border-slate-200 text-slate-700"
                      }`}
                    >
                      {msg.text}
                    </div>
                    <p className="text-[10px] mt-1 text-slate-400">
                      {msg.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* INPUT */}
            <form
              onSubmit={sendMessage}
              className="p-4 bg-white flex items-center gap-3 border-t border-slate-200"
            >
              <div className="flex-1 relative">
                <input
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Write something..."
                  className="w-full border border-slate-300 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-purple-500"
                />
                {showEmoji && (
                <>
                  {/* BACKDROP */}
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowEmoji(false)}
                  />

                  {/* EMOJI PICKER */}
                  <div className="absolute bottom-16 left-0 z-50 shadow-2xl">
                    <EmojiPicker
                      onEmojiClick={(emoji) =>
                        setMessage((prev) => prev + emoji.emoji)
                      }
                      height={350}
                      width={300}
                      searchDisabled
                    />
                  </div>
                </>
              )}
                
                <Smile
                  size={20}
                  onClick={() => setShowEmoji((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer"
                />
              </div>
              <button
                disabled={!message.trim()}
                className="bg-purple-600 text-white p-3 rounded-xl disabled:bg-slate-300"
              >
                <Send size={18} />
              </button>
            </form>
          </>
        )}
      </section>
    </div>
  )
}
