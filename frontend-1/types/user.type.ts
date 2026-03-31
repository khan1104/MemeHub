export interface User {
  user_id: string;
  user_name: string;
  email: string;
  profile_pic: string;
  bio: string;
  created_at: string;
  total_posts: number;
  total_followers: number;
  total_following: number;
  total_friends: number;
  isFollowing: boolean;
  isFriend: boolean;
  isRequestSent:boolean;
};


export interface FollowData {
  user_id: string;
  user_name: string;
  profile_pic?: string;
  isFollowing?: boolean;
  isFriend?: boolean;
  created_at: string;
};


export interface PaginatedFollowDataResponse {
  items: FollowData[];
  next_cursor: string | null;
  has_next: boolean;
}

export interface MonthlyTopUsers{
    user_id:string
    user_name:string
    profile_pic:string
    total_likes:number

}