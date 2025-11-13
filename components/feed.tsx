"use client"

import { MessageCircle, Share2, Bookmark } from "lucide-react"
import { useState } from "react"
import LikeButton from "./like-button"

interface Post {
  id: string
  author: {
    name: string
    title: string
    avatar: string
    specialization: string
  }
  content: string
  timestamp: string
  likes: number
  comments: number
  liked: boolean
  image?: string
}

export default function Feed() {
  // TODO: Obtener posts del backend cuando esté disponible
  const [posts, setPosts] = useState<Post[]>([])

  const handleLike = (postId: string, liked: boolean) => {
    setPosts(
      posts.map((post) =>
        post.id === postId ? { ...post, liked, likes: liked ? post.likes + 1 : post.likes - 1 } : post,
      ),
    )
  }

  return (
    <div className="max-w-2xl mx-auto py-6 px-4 md:px-0">
      <div className="space-y-6">
        {posts.length === 0 ? (
          <div className="card-modern text-center py-12">
            <p className="text-neutral-400">No hay publicaciones disponibles</p>
            <p className="text-neutral-500 text-sm mt-2">
              Las publicaciones del feed estarán disponibles próximamente
            </p>
          </div>
        ) : (
          posts.map((post) => (
          <div key={post.id} className="card-modern">
            {/* Author Info */}
            <div className="flex items-start gap-3 mb-4">
              <img
                src={post.author.avatar || "/placeholder.svg"}
                alt={post.author.name}
                className="w-12 h-12 rounded-full object-cover border border-neutral-700"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-white">{post.author.name}</h3>
                <p className="text-sm text-neutral-400">{post.author.title}</p>
                <p className="text-xs text-neutral-500">{post.timestamp}</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-xs text-blue-300 font-medium">
                {post.author.specialization}
              </span>
            </div>

            {/* Content */}
            <p className="text-neutral-200 mb-4 leading-relaxed">{post.content}</p>

            {/* Image */}
            {post.image && (
              <img
                src={post.image || "/placeholder.svg"}
                alt="Post content"
                className="w-full rounded-lg border border-neutral-700 mb-4 object-cover max-h-96"
              />
            )}

            {/* Stats */}
            <div className="flex items-center justify-between text-xs text-neutral-400 mb-4 pb-4 border-b border-neutral-700">
              <span>{post.likes} me gusta</span>
              <span>{post.comments} comentarios</span>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <LikeButton
                initialLikes={post.likes}
                initialLiked={post.liked}
                onLike={(liked) => handleLike(post.id, liked)}
              />
              <button className="flex-1 flex items-center justify-center gap-2 py-2 text-neutral-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors">
                <MessageCircle className="w-5 h-5" />
                <span className="text-sm">Comentar</span>
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 py-2 text-neutral-400 hover:text-green-400 hover:bg-green-500/10 rounded-lg transition-colors">
                <Share2 className="w-5 h-5" />
                <span className="text-sm">Compartir</span>
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 py-2 text-neutral-400 hover:text-yellow-400 hover:bg-yellow-500/10 rounded-lg transition-colors">
                <Bookmark className="w-5 h-5" />
                <span className="text-sm">Guardar</span>
              </button>
            </div>
          </div>
          ))
        )}
      </div>
    </div>
  )
}
