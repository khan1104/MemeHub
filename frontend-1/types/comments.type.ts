// src/types/comment.ts


export interface User {
  user_id:string
  user_name: string
  profile_pic: string
}

export interface Comment {
  comment_id: string
  comment: string
  created_at: string
  like_count: number
  dislike_count: number
  is_liked:boolean
  is_disliked:boolean
  created_by: User
}

export interface PaginatedCommentResponse {
  items: Comment[];
  next_cursor: string | null;
  has_next: boolean;
}
