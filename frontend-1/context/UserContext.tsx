"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { handleGetCurrentUser } from "@/services/user.service";
import { User } from "@/types/user.type";

// type User = {
//   _id: string;
//   user_name: string;
//   email: string;
//   profile_pic?: string;
//   bio: string;
//   created_at: string;
//   total_posts: number;
//   total_followers: number;
//   total_following: number;
//   total_friends: number;
// };

type UserContextType = {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  loadUser: () => Promise<void>;
};

const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const loadUser = async () => {
    try {
      const data = await handleGetCurrentUser();
      setUser(data);
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, loadUser }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within UserProvider");
  }
  return context;
};
