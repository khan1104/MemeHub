"use client"

import React, { useState, useRef, useEffect, useCallback } from 'react'
import RightSidebar from '@/components/layout/RightSidebar'
import PostCard from '@/components/PostsCard' 
import { usePost } from '@/hooks/post'
import { Post } from '@/types/posts.type'

import { useFeed } from '@/context/FeedContext'

export default function Home() {
  const { fetchPosts, loading, error } = usePost();
  const { feed} = useFeed();

  
  // Feed State
  const [posts, setPosts] = useState<Post[]>([])
  const [cursor, setCursor] = useState<string | null>(null)
  const [hasNext, setHasNext] = useState(true)
  
  // Refs
  const loaderRef = useRef<HTMLDivElement | null>(null)


  // 1. Fetch Logic
  const loadPosts = useCallback(
    async (isInitial = false) => {
      if (loading || (!hasNext && !isInitial)) return;

      const currentCursor = isInitial ? null : cursor;
      const data = await fetchPosts(currentCursor); // Ensure your hook accepts 'active'

      if (!data) return;

      if (isInitial) {
        setPosts(data.items);
      } else {
        setPosts((prev) => [...prev, ...data.items]);
      }

      setCursor(data.next_cursor);
      setHasNext(data.has_next);
    },
    [cursor, hasNext, loading, fetchPosts],
  );

  // 2. Reset feed when Category changes
    useEffect(() => {
      setPosts([]);
      setCursor(null);
      setHasNext(true);
      loadPosts(true);
    }, [feed]);

  // 3. Infinite Scroll (Intersection Observer)
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasNext && !loading) {
          loadPosts()
        }
      },
      { threshold: 0.1 }
    )

    if (loaderRef.current) {
      observer.observe(loaderRef.current)
    }

    return () => observer.disconnect()
  }, [loadPosts, hasNext, loading])


  return (
    <div className="mx-auto flex max-w-360 gap-6 px-2 sm:px-5 lg:px-8 pt-10">
      {/* MAIN FEED */}
      <main className="w-full max-w-170 mx-auto flex flex-col gap-5">

        {/* POSTS LIST */}
        <div className="flex flex-col gap-2">
          {posts.length > 0 ? (
            <>
              {posts.map((post) => (
                <PostCard key={post.post_id} post={post} />
              ))}

              {/* SENTINEL ELEMENT FOR INFINITE SCROLL */}
              <div
                ref={loaderRef}
                className="h-10 flex items-center justify-center"
              >
                {loading && (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-700"></div>
                )}
              </div>
            </>
          ) : (
            !loading && (
              <div className="py-20 text-center text-gray-500 font-medium">
                No Posts found in this category yet!
              </div>
            )
          )}

          {/* Loading Skeleton/State if first load and no posts yet */}
          {loading && posts.length === 0 && (
            <div className="text-center py-10 text-gray-400">
              Loading feed...
            </div>
          )}

          {error && (
            <div className="text-center py-10 text-red-500">
              Error loading posts.
            </div>
          )}
        </div>
      </main>

      {/* SIDEBAR */}
      <aside className="hidden lg:block w-[320px] shrink-0">
        <div className="sticky top-5 py-3 -mt-6">
          <RightSidebar />
        </div>
      </aside>
    </div>
  );
}