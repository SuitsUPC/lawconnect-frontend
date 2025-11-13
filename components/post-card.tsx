"use client"

import { Heart, MessageCircle, Share2, MoreHorizontal } from "lucide-react"
import { useState } from "react"

interface PostCardProps {
  post: {
    id: number
    author: string
    role: string
    content: string
    likes: number
    comments: number
    shares: number
    timestamp: string
  }
}

export default function PostCard({ post }: PostCardProps) {
  const [liked, setLiked] = useState(false)
  const [likes, setLikes] = useState(post.likes)

  const handleLike = () => {
    setLiked(!liked)
    setLikes(liked ? likes - 1 : likes + 1)
  }

  return (
    <div className="card-modern">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-accent flex items-center justify-center text-sm font-bold text-neutral-900">
            {post.author.charAt(0)}
          </div>
          <div>
            <h4 className="font-semibold text-foreground">{post.author}</h4>
            <p className="text-xs text-neutral-400">
              {post.role} • {post.timestamp}
            </p>
          </div>
        </div>
        <button className="p-2 hover:bg-neutral-700 rounded-lg transition">
          <MoreHorizontal className="w-4 h-4 text-neutral-400" />
        </button>
      </div>

      {/* Content */}
      <p className="text-foreground mb-4 leading-relaxed">{post.content}</p>

      {/* Stats */}
      <div className="flex gap-4 text-xs text-neutral-400 py-3 border-t border-b border-neutral-700 mb-4">
        <span className="hover:text-accent cursor-pointer">{likes} Me gusta</span>
        <span className="hover:text-accent cursor-pointer">{post.comments} Comentarios</span>
        <span className="hover:text-accent cursor-pointer">{post.shares} Compartidos</span>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={handleLike}
          className="flex-1 flex items-center justify-center gap-2 py-2 hover:bg-neutral-700/50 rounded-lg transition group"
        >
          <Heart
            className={`w-5 h-5 transition ${liked ? "fill-accent text-accent" : "text-neutral-400 group-hover:text-accent"}`}
          />
          <span className="text-sm font-medium text-neutral-400 group-hover:text-accent">Me gusta</span>
        </button>
        <button className="flex-1 flex items-center justify-center gap-2 py-2 hover:bg-neutral-700/50 rounded-lg transition group">
          <MessageCircle className="w-5 h-5 text-neutral-400 group-hover:text-blue-400" />
          <span className="text-sm font-medium text-neutral-400 group-hover:text-blue-400">Comentar</span>
        </button>
        <button className="flex-1 flex items-center justify-center gap-2 py-2 hover:bg-neutral-700/50 rounded-lg transition group">
          <Share2 className="w-5 h-5 text-neutral-400 group-hover:text-accent" />
          <span className="text-sm font-medium text-neutral-400 group-hover:text-accent">Compartir</span>
        </button>
      </div>
    </div>
  )
}
