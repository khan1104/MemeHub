"use client";

import { createContext, useContext, useState } from "react";

type FeedType =
  | "trending"
  | "top"
  | "new"
  | "funny"
  | "relatable"
  | "dark"
  | "college"
  | "programming"
  | "office";

type FeedContextType = {
  feed: FeedType;
  setFeed: (type: FeedType) => void;
};

const FeedContext = createContext<FeedContextType | null>(null);

export const FeedProvider = ({ children }: { children: React.ReactNode }) => {
  const [feed, setFeed] = useState<FeedType>("trending");

  return (
    <FeedContext.Provider value={{ feed, setFeed }}>
      {children}
    </FeedContext.Provider>
  );
};

export const useFeed = () => {
  const ctx = useContext(FeedContext);
  if (!ctx) throw new Error("useFeed must be used inside FeedProvider");
  return ctx;
};
