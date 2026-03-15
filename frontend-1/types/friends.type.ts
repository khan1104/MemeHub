export interface Friend {
  user_id: string
  user_name: string
  profile_pic:string
  isFollowing?: boolean;
  isFriend?: boolean;
  created_at: string;
}

export interface PaginatedFriendResponse {
  items: Friend[];
  next_cursor: string | null;
  has_next: boolean;
}


export interface Request {
  id:string;
  user_id:string;
  user_name: string;
  profile_pic:string;
  created_at: string;
}

export interface PaginatedRequestResponse {
  items: Request[];
  next_cursor: string | null;
  has_next: boolean;
}