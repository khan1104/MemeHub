// src/types/post.ts

export type MediaType = "image" | "video"


export interface LikedPost {
  _id:string
  post_id: string
  caption: string
  media_url: string
  media_type: MediaType
  created_at: string
  like_count: number
}


export interface PaginatedPostResponse {
  items: LikedPost[];
  next_cursor: string | null;
  has_next: boolean;
}
