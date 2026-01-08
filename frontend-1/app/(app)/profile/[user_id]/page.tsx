"use client"

import Image from "next/image"
import {
  Edit,
  ImageIcon,
  Heart,
  MessageCircle,
  Users,
  UserPlus,
} from "lucide-react"
import { useRouter } from "next/navigation"


export default function Profile() {
  const user="123";
  const router=useRouter();
  return (
    <div className="w-full h-screen flex">
      {/* Main Section */}
      <div className="flex-1 flex flex-col">
        {/* Profile Header */}
        <div className="p-5 sm:p-5 sticky z-10">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            {/* Profile Image */}
            <div className="relative mx-auto md:mx-0">
              <Image
                src="https://terpdfhqqmambcxoyrxn.supabase.co/storage/v1/object/public/profile_pics/default_profile_pics/default_pic.png"
                alt="Profile"
                width={110}
                height={110}
                className="rounded-full border"
              />
              <button className="absolute bottom-1 right-1 bg-primary text-white p-2 rounded-full shadow">
                <Edit size={14} />
              </button>
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-xl sm:text-2xl font-semibold">
                John Doe
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                Meme lover 😄 | Dark humor | Programming jokes
              </p>

              {/* Stats */}
              <div className="flex flex-wrap justify-center md:justify-start gap-6 mt-4 text-sm">
                <div>
                  <span className="font-semibold">128</span> Posts
                </div>

                <button className="flex items-center gap-2 hover:text-purple-600" onClick={()=>router.push("/friends")}>
                  <Users size={16} />
                  <span className="font-semibold">312</span> Friends
                </button>

                <button className="flex items-center gap-2 hover:text-purple-600" onClick={()=>router.push(`/profile/${user}/followers`)}>
                  <UserPlus size={16} />
                  <span className="font-semibold">1.2k</span> Followers
                </button>
                <button className="flex items-center gap-2 hover:text-purple-600" onClick={()=>router.push("/profile/123/following")}>
                  <UserPlus size={16} />
                  <span className="font-semibold">100</span> Following
                </button>
              </div>
            </div>

            {/* Edit Button */}
            <div className="w-full md:w-auto">
              <button className="w-full md:w-auto bg-primary text-white px-5 py-2 rounded-xl hover:bg-[#6D28D9] transition">
                Edit Profile
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-6 flex gap-6 border-b text-sm font-medium overflow-x-auto">
            <button className="pb-3 border-b-2  text-primary whitespace-nowrap">
              My Memes
            </button>
            <button className="pb-3 text-gray-500 hover:text-primary whitespace-nowrap">
              Most Liked
            </button>
            <button className="pb-3 text-gray-500 hover:text-primary whitespace-nowrap">
              Saved
            </button>
          </div>
        </div>

        {/* Meme Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 hover-scrollbar">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((meme) => (
              <div
                key={meme}
                className="bg-white rounded-xl shadow hover:shadow-md transition overflow-hidden"
              >
                <div className="h-48 bg-gray-200 flex items-center justify-center">
                  <ImageIcon className="text-gray-400" size={48} />
                </div>

                <div className="p-4 flex justify-between text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Heart size={16} /> 120
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageCircle size={16} /> 34
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
