"use client"

import { useState } from "react"
import { Heart } from "lucide-react"

interface LikeButtonProps {
  initialLikes?: number
  initialLiked?: boolean
  onLike?: (liked: boolean) => void
}

export default function LikeButton({ initialLikes = 0, initialLiked = false, onLike }: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked)
  const [likeCount, setLikeCount] = useState(initialLikes)

  const handleLike = () => {
    const newLiked = !liked
    setLiked(newLiked)
    setLikeCount(newLiked ? likeCount + 1 : likeCount - 1)
    onLike?.(newLiked)
  }

  return (
    <button
      onClick={handleLike}
      className="flex items-center gap-2 text-neutral-400 hover:text-red-400 transition-colors group"
    >
      <Heart
        className={`w-5 h-5 transition-all duration-300 ${
          liked ? "fill-red-500 text-red-500 scale-110" : "group-hover:scale-110"
        }`}
      />
      <span className={`text-sm ${liked ? "text-red-400 font-semibold" : ""}`}>{likeCount}</span>
    </button>
  )
}
