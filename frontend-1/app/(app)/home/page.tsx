"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import RightSidebar from "@/components/layout/RightSidebar";
import PostCard from "@/components/PostsCard";
import PostCardSkeleton from "@/components/skeletons/PostCard";
import { usePost } from "@/hooks/post";
import { Post } from "@/types/posts.type";

import { useFeed } from "@/context/FeedContext";
import { useUser } from "@/context/UserContext";

export default function Home() {
  const { user: currentUser, isLoading, isLoggedIn } = useUser();
  const { getPosts, loading, error } = usePost();
  const { feed } = useFeed();

  // Feed State
  const [posts, setPosts] = useState<Post[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasNext, setHasNext] = useState(true);

  // Refs
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const fetchingRef = useRef(false);

  // 1. Fetch Logic
  const loadPosts = useCallback(
    async (isInitial = false) => {
      if (isLoading) return;
      if (loading) return;
      if (fetchingRef.current) return;
      if (!hasNext && !isInitial) return;

      fetchingRef.current = true;

      const currentCursor = isInitial ? null : cursor;
      const data = await getPosts(currentCursor);
      if (!data) {
        setHasNext(false);
        fetchingRef.current = false;
        return;
      }

      if (data) {
        if (isInitial) {
          setPosts(data.items);
        } else {
          setPosts((prev) => [...prev, ...data.items]);
        }

        setCursor(data.next_cursor);
        setHasNext(data.has_next);
      }

      fetchingRef.current = false;
    },
    [cursor, hasNext, getPosts, isLoading,loading],
  );

  // 2. Reset feed when Category changes
  useEffect(() => {
    if (isLoading) return;
    fetchingRef.current = false;
    setPosts([]);
    setCursor(null);
    setHasNext(true);
    loadPosts(true);
  }, [feed]);

  // 3. Infinite Scroll (Intersection Observer)
  
  useEffect(() => {
    const currentLoader = loaderRef.current;
    if (!currentLoader) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && hasNext && !fetchingRef.current) {
          loadPosts();
        }
      },
      {
        rootMargin: "150px", // preload before reaching bottom
        threshold: 0,
      },
    );

    observer.observe(currentLoader);

    return () => {
      if (currentLoader) observer.disconnect();
    };
  }, [hasNext, loadPosts]);


  return (
    <div className="mx-auto flex max-w-360 gap-6 px-2 sm:px-5 lg:px-8 pt-8">
      {/* MAIN FEED */}
      <main className="w-full max-w-170 flex flex-col gap-5">
        {error && (
          <div className="text-center py-10 text-red-500">{error}.</div>
        )}
        {/* POSTS LIST */}
        <div className="flex flex-col gap-2">
          {/* INITIAL SKELETON */}
          {loading && posts.length === 0 ? (
            <>
              {[...Array(5)].map((_, i) => (
                <PostCardSkeleton key={i} />
              ))}
            </>
          ) : (
            <>
              {posts.map((post) => (
                <PostCard
                  key={post.post_id}
                  post={post}
                  currentUser={currentUser}
                  isLoggedIn={isLoggedIn}
                />
              ))}
            </>
          )}

          {/* SCROLL LOADER */}
          <div ref={loaderRef} className="flex flex-col gap-2">
            {loading && posts.length > 0 && (
              <>
                {[...Array(2)].map((_, i) => (
                  <PostCardSkeleton key={`scroll-${i}`} />
                ))}
              </>
            )}
            {!hasNext && posts.length > 0 && (
              <div className="text-center text-gray-500 py-5">
                No more posts 🚀
              </div>
            )}
          </div>
        </div>
      </main>

      {/* SIDEBAR */}
      <aside className="hidden lg:block w-[320px] shrink-0 mx-auto">
        <div className="sticky top-5 py-3 -mt-6">
          <RightSidebar />
        </div>
      </aside>
    </div>
  );
}
