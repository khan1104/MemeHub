"use client"

import React, { useState, useRef, useEffect } from 'react'
import RightSidebar from '@/components/RightSidebar'
import PostCard from '@/components/MemeCard' 
import { ChevronLeft, ChevronRight } from 'lucide-react'

const categories = [
  "All",
  "Funny",
  "Dark",
  "Relatable",
  "College",
  "Programming",
  "Politics",
  "Office",
  "Offices",
  "Office4",
]

const posts = [
  {
    "_id": "694c01ff8ae88cfb331532a4",
    "caption": "best journey",
    "media_url": "https://terpdfhqqmambcxoyrxn.supabase.co/storage/v1/object/public/users_posts/videos/077386c5-87a9-4690-94f1-a7c0a731c97c.mp4",
    "media_type": "video",
    "tags": ["college"],
    "created_at": "2025-12-24T20:38:47.050Z",
    "like_count": 4,
    "dislike_count": 1,
    "created_by": {
      "user_name": "Legend",
      "profile_pic": "https://terpdfhqqmambcxoyrxn.supabase.co/storage/v1/object/public/users_posts/images/8e0a2b15-3ee3-40b1-b565-c0db64e322e1.png"
    }
  },
  {
    "_id": "694c02258ae88cfb331532a5",
    "caption": "me on date",
    "media_url": "https://terpdfhqqmambcxoyrxn.supabase.co/storage/v1/object/public/users_posts/images/3c22a929-dc93-460c-8716-ffa2280cb552.jpg",
    "media_type": "image",
    "tags": ["funny"],
    "created_at": "2025-12-24T17:06:43.382000",
    "like_count": 8,
    "dislike_count": 0,
    "created_by": {
      "user_name": "Legend",
      "profile_pic": "https://terpdfhqqmambcxoyrxn.supabase.co/storage/v1/object/public/users_posts/images/8e0a2b15-3ee3-40b1-b565-c0db64e322e1.png"
    }
  },
  {
    "_id": "694c023b8ae88cfb331532a6",
    "caption": "vibe coder",
    "media_url": "https://terpdfhqqmambcxoyrxn.supabase.co/storage/v1/object/public/users_posts/images/a0a7cd6d-5dd1-4744-8b3f-72b18bad69c0.jpg",
    "media_type": "image",
    "tags": ["relatable"],
    "created_at": "2025-12-24T17:06:43.382000",
    "like_count": 1,
    "dislike_count": 0,
    "created_by": {
      "user_name": "Legend",
      "profile_pic": "https://terpdfhqqmambcxoyrxn.supabase.co/storage/v1/object/public/users_posts/images/8e0a2b15-3ee3-40b1-b565-c0db64e322e1.png"
    }
  }
]

export default function Home() {
  const [active, setActive] = useState("All")
  const scrollRef = useRef<HTMLDivElement>(null)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(true)

  const filteredPosts = active === "All" 
    ? posts 
    : posts.filter(post => post.tags.includes(active.toLowerCase()))

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      setShowLeftArrow(scrollLeft > 0)
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 1)
    }
  }

  useEffect(() => {
    checkScroll() 
    window.addEventListener('resize', checkScroll)
    return () => window.removeEventListener('resize', checkScroll)
  }, [])

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 300
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      })
    }
  }

  return (
    <div className="mx-auto flex max-w-[1440px] gap-6 px-4 sm:px-5 lg:px-8 pt-6">
      
      {/* MAIN FEED */}
      <main className="w-full max-w-[680px] mx-auto flex flex-col gap-5">

        {/* CATEGORY BAR */}
        <div className="sticky top-[-24px] z-20 bg-white py-3 -mt-6">
          <div className="group relative flex items-center">
            
            {showLeftArrow && (
              <div className="absolute left-0 z-30 flex items-center bg-gradient-to-r from-[#F8F9FA] via-[#F8F9FA] to-transparent pr-10">
                <button 
                  onClick={() => scroll("left")}
                  className="flex h-9 w-9 items-center justify-center rounded-full shadow-md hover:bg-gray-100 border border-gray-200"
                >
                  <ChevronLeft size={20} />
                </button>
              </div>
            )}

            <div 
              ref={scrollRef}
              onScroll={checkScroll}
              className="flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth px-2 no-scrollbar"
            >
              {categories.map((item) => (
                <button
                  key={item}
                  onClick={() => setActive(item)}
                  className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all shrink-0
                    ${active === item
                        ? "bg-purple-100 text-purple-700"
                        : "bg-gray-100 text-gray-800 hover:bg-gray-300 border border-transparent"
                    }`}
                >
                  {item}
                </button>
              ))}
            </div>

            {showRightArrow && (
              <div className="absolute right-0 z-30 flex items-center bg-gradient-to-l from-[#F8F9FA] via-[#F8F9FA] to-transparent pl-10">
                <button 
                  onClick={() => scroll("right")}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-md hover:bg-gray-100 border border-gray-200"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {filteredPosts.length > 0 ? (
            filteredPosts.map((post: any) => (
              <PostCard key={post._id} post={post} />
            ))
          ) : (
            <div className="py-20 text-center text-gray-500 font-medium">
              No memes found in this category yet!
            </div>
          )}
        </div>
      </main>

      <aside className="hidden lg:block w-[320px] shrink-0">
        <div className="sticky top-2">
           <RightSidebar/>
        </div>
      </aside>
    </div>
  )
}