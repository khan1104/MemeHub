"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";

import UserPostCard from "../UserPostsCrad";
import { usePost } from "@/hooks/post";
import { Post } from "@/types/posts.type";



type Props = {
  user_id: string;
  sort: "latest" | "top" | "oldest";
};

function UsersPosts({ user_id, sort }: Props) {

  const {fetchUserPosts,loading,error}=usePost()

  // Feed State
  const [posts, setPosts] = useState<Post[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasNext, setHasNext] = useState(true);

  // Refs
  const loaderRef = useRef<HTMLDivElement | null>(null);

  // 1. Fetch Logic
  const loadPosts = useCallback(
    async (isInitial = false) => {
      if (loading || (!hasNext && !isInitial)) return;

      const currentCursor = isInitial ? null : cursor;
      const data = await fetchUserPosts(user_id,sort,currentCursor); // Ensure your hook accepts 'active'

      if (!data) return;

      if (isInitial) {
        setPosts(data.items);
      } else {
        setPosts((prev) => [...prev, ...data.items]);
      }

      setCursor(data.next_cursor);
      setHasNext(data.has_next);
    },
    [cursor, hasNext, loading, fetchUserPosts,user_id,sort],
  );

  // 2. Reset feed when Category changes
  useEffect(() => {
    const init = async () => {
      setPosts([]);
      setCursor(null);
      setHasNext(true);
      await loadPosts(true);
    };

    init();
  }, [sort, user_id]);

  // 3. Infinite Scroll (Intersection Observer)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNext && !loading) {
          loadPosts();
        }
      },
      { threshold: 0.1 },
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [loadPosts, hasNext, loading]);


  return (
       
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-6">
            {posts.map((post) => (
              <UserPostCard
                key={post.post_id}
                post={post}
                onDelete={()=>console.log("deleted")}
              />
            ))}

            {hasNext && (
              <div
                ref={loaderRef}
                className="h-10 flex items-center justify-center"
              >
                {loading && (
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700"></div>
                )}
              </div>
            )}
          </div>
  );
}

export default UsersPosts;
