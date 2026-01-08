"use client"

import React, { useState} from 'react'
import PostCard from '@/components/PostsCard' 
import { Post } from '@/types/Posts';
import Image from "next/image"
import { useRouter } from "next/navigation";
import { Send, Smile, MoreHorizontal, Pencil, Trash2, Flag, ThumbsUp, ThumbsDown } from "lucide-react"
import EmojiPicker from "emoji-picker-react"
import RightSidebar from '@/components/layout/RightSidebar';

const post: Post = 
  {
    "_id": "694c02258ae88cfb331532a5",
    "caption": "me on date",
    "media_url": "https://terpdfhqqmambcxoyrxn.supabase.co/storage/v1/object/public/users_posts/images/3c22a929-dc93-460c-8716-ffa2280cb552.jpg",
    "media_type": "image",
    "tags": ["funny"],
    "created_at": "2025-12-24T17:06:43.382000",
    "like_count": 8,
    "dislike_count": 0,
    "created_by": {
      "_id":"694c01ff8ae88cfb331532a4",
      "user_name": "Legend",
      "profile_pic": "https://terpdfhqqmambcxoyrxn.supabase.co/storage/v1/object/public/users_posts/images/8e0a2b15-3ee3-40b1-b565-c0db64e322e1.png"
    }
  }

type User = {
  _id: string
  user_name: string
  profile_pic: string
}

type Comment = {
  _id: string
  comment: string
  like_count:number
  dislike_count:number
  created_at: string
  user: User
}

const comments:Comment[]=[
    {
      _id: "1",
      comment: "Nice content, keep posting!",
      like_count:10,
      dislike_count:2,
      created_at: new Date().toISOString(),
      user: {
        _id: "123",
        user_name: "John",
        profile_pic: "https://terpdfhqqmambcxoyrxn.supabase.co/storage/v1/object/public/profile_pics/default_profile_pics/default_pic.png",
      }
    },
    {
      _id: "2",
      comment: "Nice content, keep posting!",
      like_count:5,
      dislike_count:6,
      created_at: new Date().toISOString(),
      user: {
        _id: "124",
        user_name: "John",
        profile_pic: "https://terpdfhqqmambcxoyrxn.supabase.co/storage/v1/object/public/profile_pics/default_profile_pics/default_pic.png",
      }
    },
    {
      _id: "3",
      comment: "Nice content, keep posting!",
      like_count:4,
      dislike_count:0,
      created_at: new Date().toISOString(),
      user: {
        _id: "125",
        user_name: "John",
        profile_pic: "https://terpdfhqqmambcxoyrxn.supabase.co/storage/v1/object/public/profile_pics/default_profile_pics/default_pic.png",
      }
    },
    {
      _id: "4",
      comment: "Nice content, keep posting!",
      like_count:1,
      dislike_count:1,
      created_at: new Date().toISOString(),
      user: {
        _id: "126",
        user_name: "John",
        profile_pic: "https://terpdfhqqmambcxoyrxn.supabase.co/storage/v1/object/public/profile_pics/default_profile_pics/default_pic.png",
      }
    },
]

export default function Home() {
    const router=useRouter();
    const [showEmoji, setShowEmoji] = useState(false)
    const [commentText, setCommentText] = useState("")
    // Track which comment's menu is currently open
    const [activeMenu, setActiveMenu] = useState<string | null>(null)
    
    const current_user_id = "123"
    const current_user_pic = "https://terpdfhqqmambcxoyrxn.supabase.co/storage/v1/object/public/profile_pics/default_profile_pics/default_pic.png"

    const handleSendComment = () => {
        if (!commentText.trim()) return
        setCommentText("")
        setShowEmoji(false)
    }

    // Toggle menu visibility
    const toggleMenu = (id: string) => {
        setActiveMenu(activeMenu === id ? null : id)
    }

    const handleCommentLike=(comment_id:string,user_id:string)=>{
        console.log(comment_id);
        console.log(user_id)
    }

    const handleCommentDislike=(comment_id:string,user_id:string)=>{
        console.log(comment_id);
        console.log(user_id)
    }

    const handleCommentReport=(comment_id:string,user_id:string)=>{
        console.log(comment_id);
        console.log(user_id)
    }

    const handleCommentDelete=(comment_id:string,user_id:string)=>{
        console.log(comment_id);
        console.log(user_id)
    }

    const handleCommentUpdate=(comment_id:string,user_id:string,comment:string)=>{
        console.log(comment_id);
        console.log(user_id)
    }

    return (
        <div className="mx-auto flex max-w-360 gap-6 px-2 sm:px-5 lg:px-8" onClick={() => setActiveMenu(null)}>
            <main className="w-full max-w-170 mx-auto flex flex-col gap-2">
                <PostCard key={post._id} post={post} />

                <div className="space-y-6 rounded-xl">
                    <h3 className="font-bold text-lg">{comments.length} Comments</h3>

                    {/* Input Box */}
                    <div className="flex gap-3 items-start">
                        <Image src={current_user_pic} alt="user" width={36} height={36} className="rounded-full object-cover shrink-0" />
                        <div className="relative flex-1">
                            <div className="flex items-center gap-2 bg-gray-100 rounded-2xl px-4 py-2 focus-within:ring-2 focus-within:ring-blue-500">
                                <input
                                    type="text"
                                    placeholder="Write a comment..."
                                    className="bg-transparent flex-1 outline-none text-sm py-1"
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSendComment()}
                                />
                                <button onClick={() => setShowEmoji(!showEmoji)} className="text-gray-500 hover:text-yellow-500">
                                    <Smile size={20} />
                                </button>
                                <button onClick={handleSendComment} disabled={!commentText.trim()} className="text-blue-600 disabled:text-gray-400">
                                    <Send size={20} />
                                </button>
                            </div>
                            {showEmoji && (
                                <>
                                    {/* BACKDROP */}
                                    <div
                                    className="fixed inset-0 z-40"
                                    onClick={() => setShowEmoji(false)}
                                    />
                
                                    {/* EMOJI PICKER */}
                                    <div className="absolute bottom-16 left-0 z-50 shadow-2xl">
                                    <EmojiPicker
                                        height={350}
                                        width={300}
                                        searchDisabled
                                    />
                                    </div>
                                </>
                                )}
                        </div>
                    </div>

                    {/* Comments List */}
                    <div className="flex flex-col gap-6">
                        {comments.map((comment) => {
                            const isOwner = comment.user._id === current_user_id;

                            return (
                                <div key={comment._id} className="flex gap-3">
                                    <Image src={comment.user.profile_pic} alt={comment.user.user_name} width={56} height={56} className="rounded-full object-cover h-9 w-9" />
                                    
                                    <div className="flex flex-col flex-1">
                                        <div className="bg-gray-50 px-4 py-2 rounded-2xl relative">
                                            {/* Header */}
                                            <div className="flex justify-between items-center mb-1">
                                                <div className="flex items-center gap-2" onClick={()=>router.push(`/profile/${comment.user._id}`)}>
                                                    <span className="font-bold text-sm text-gray-900">{comment.user.user_name}</span>
                                                    <span className="text-[11px] text-gray-400">• {new Date(comment.created_at).toLocaleDateString()}</span>
                                                </div>

                                                {/* Action Menu */}
                                                <div className="relative" onClick={(e) => e.stopPropagation()}>
                                                    <button 
                                                        onClick={() => toggleMenu(comment._id)}
                                                        className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200"
                                                    >
                                                        <MoreHorizontal size={16} />
                                                    </button>
                                                    
                                                    {activeMenu === comment._id && (
                                                        <div className="absolute right-0 top-8 bg-white border border-gray-100 shadow-lg rounded-lg flex-col py-1 z-10 w-32 flex">
                                                            {isOwner ? (
                                                                <>
                                                                    <button className="flex items-center gap-2 px-3 py-2 text-xs hover:bg-gray-50 text-gray-700">
                                                                        <Pencil size={14} /> Update
                                                                    </button>
                                                                    <button className="flex items-center gap-2 px-3 py-2 text-xs hover:bg-gray-50 text-red-600">
                                                                        <Trash2 size={14} /> Delete
                                                                    </button>
                                                                </>
                                                            ) : (
                                                                <button className="flex items-center gap-2 px-3 py-2 text-xs hover:bg-gray-50 text-orange-600">
                                                                    <Flag size={14} /> Report
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <p className="text-gray-800 text-sm leading-relaxed">{comment.comment}</p>
                                        </div>

                                        {/* Like/Dislike Buttons */}
                                        <div className="flex items-center gap-4 mt-1 ml-2">
                                            <button className="flex items-center gap-1.5 text-gray-500 hover:text-blue-600 transition-colors group">
                                                <ThumbsUp size={14} className="group-active:scale-125 transition-transform" />
                                                <span className="text-xs font-medium">{comment.like_count}</span>
                                            </button>
                                            <button className="flex items-center gap-1.5 text-gray-500 hover:text-red-600 transition-colors group">
                                                <ThumbsDown size={14} className="group-active:scale-125 transition-transform" />
                                                <span className="text-xs font-medium">{comment.dislike_count}</span>
                                            </button>

                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </main>

            <aside className="hidden lg:block w-[320px] shrink-0">
                <div className="sticky top-2">
                    <RightSidebar />
                </div>
            </aside>
        </div>
    )
}