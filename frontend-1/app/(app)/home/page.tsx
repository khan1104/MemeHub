"use client"

import React, { useState, useRef, useEffect } from 'react'
import RightSidebar from '@/components/layout/RightSidebar'
import PostCard from '@/components/PostsCard' 
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { CATEGORIES } from '@/data/MemeCategories'
import { usePost } from '@/hooks/post'
import { Post } from '@/types/posts.type'


export default function Home() {
  const { fetchPosts, loading, error } = usePost()
  const [active, setActive] = useState("All")
  const scrollRef = useRef<HTMLDivElement>(null)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(true)
  const [posts, setPosts] = useState<Post[]>([])

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
  useEffect(() => {
    const loadPosts = async () => {
      const data = await fetchPosts()
      if (data) setPosts(data)
    }

    loadPosts()
  }, [])

 return(
<div className="mx-auto flex max-w-360 gap-6 px-2 sm:px-5 lg:px-8 pt-6">
      
      {/* MAIN FEED */}
      <main className="w-full max-w-170 mx-auto flex flex-col gap-5">

        {/* CATEGORY BAR */}
        <div className="sticky top-0 left-0 z-50 py-3 -mt-6 bg-white">
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
              {CATEGORIES.map((item) => (
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
          {posts.length > 0 ? (
            posts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))
            ) : (
            <div className="py-20 text-center text-gray-500 font-medium">
              No Posts found in this category yet!
            </div>
          )}
        </div>
      </main>

      <aside className="hidden lg:block w-[320px] shrink-0">
        <div className="sticky top-0 py-3 -mt-6">
           <RightSidebar/>
        </div>
      </aside>
    </div>
  )
}