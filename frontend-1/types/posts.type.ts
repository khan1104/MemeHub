// src/types/post.ts

export type MediaType = "image" | "video"

export interface User {
  user_id:string
  user_name: string
  profile_pic: string
}

export interface Post {
  post_id: string
  caption: string
  media_url: string
  media_type: MediaType
  tags: string[]
  created_at: string
  like_count: number
  dislike_count: number
  total_comments:number,
  is_liked:boolean
  is_disliked:boolean
  is_saved:boolean
  created_by: User
}

export interface PaginatedPostResponse {
  items: Post[];
  next_cursor: string | null;
  has_next: boolean;
}
