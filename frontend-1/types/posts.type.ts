// src/types/post.ts

export type MediaType = "image" | "video"

export interface User {
  _id:string
  user_name: string
  profile_pic: string
}

export interface Post {
  _id: string
  caption: string
  media_url: string
  media_type: MediaType
  tags: string[]
  created_at: string
  like_count: number
  dislike_count: number
  created_by: User
}

export interface PaginatedPostResponse {
  items: Post[];
  next_cursor: string | null;
  has_next: boolean;
}
