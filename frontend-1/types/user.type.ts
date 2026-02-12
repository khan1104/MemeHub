export interface User {
  _id: string;
  user_name: string;
  email: string;
  profile_pic?: string;
  bio: string;
  created_at: string;
  total_posts: number;
  total_followers: number;
  total_following: number;
  total_friends: number;
  isFollowing?: boolean;
  isFriend?: boolean;
};