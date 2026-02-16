export interface Friends {
  friend_id: string
  user_name: string
  profile_pic:string
  email: string;
  isFollowing?: boolean;
  isFriend?: boolean;
  created_at: string;
}

export interface PaginatedFriendResponse {
  items: Friends[];
  next_cursor: string | null;
  has_next: boolean;
}