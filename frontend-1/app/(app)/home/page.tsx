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
  const { fetchPosts, loading, error } = usePost();
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
      if (fetchingRef.current) return;
      if (!hasNext && !isInitial) return;

      fetchingRef.current = true;

      const currentCursor = isInitial ? null : cursor;
      const data = await fetchPosts(currentCursor);

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
    [cursor, hasNext, fetchPosts, isLoading],
  );

  // 2. Reset feed when Category changes
  useEffect(() => {
    if (isLoading) return;
    setPosts([]);
    setCursor(null);
    setHasNext(true);
    loadPosts(true);
  }, [feed, isLoading]);

  // 3. Infinite Scroll (Intersection Observer)
  useEffect(() => {
    if (!loaderRef.current) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasNext && !fetchingRef.current) {
        loadPosts();
      }
    });

    observer.observe(loaderRef.current);

    return () => observer.disconnect();
  }, [hasNext, loadPosts]);


  return (
    <div className="mx-auto flex max-w-360 gap-6 px-2 sm:px-5 lg:px-8 pt-8">
      {/* MAIN FEED */}
      <main className="w-full max-w-170 flex flex-col gap-5">
        {/* POSTS LIST */}
        <div className="flex flex-col gap-2">
          {/* ERROR */}
          {error && (
            <div className="text-center py-10 text-red-500">
              Error loading posts.
            </div>
          )}
          {/* INITIAL SKELETON */}
          {loading && posts.length === 0 && (
            <>
              {[...Array(5)].map((_, i) => (
                <PostCardSkeleton key={i} />
              ))}
            </>
          )}

          {/* POSTS */}
          {posts.map((post) => (
            <PostCard
              key={post.post_id}
              post={post}
              currentUser={currentUser}
              isLoggedIn={isLoggedIn}
            />
          ))}

          {/* SCROLL LOADER */}
          <div ref={loaderRef} className="flex flex-col gap-2">
            {loading && posts.length > 0 && (
              <>
                {[...Array(2)].map((_, i) => (
                  <PostCardSkeleton key={`scroll-${i}`} />
                ))}
              </>
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
