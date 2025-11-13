"use client"

import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

interface Message {
  id: string
  name: string
  avatar: string
  lastMessage: string
  timestamp: Date
  unread: number
  online: boolean
}

interface MessagesListProps {
  selectedChat: string
  onSelectChat: (id: string) => void
  searchQuery: string
}

export default function MessagesList({ selectedChat, onSelectChat, searchQuery }: MessagesListProps) {
  // TODO: Conectar con el backend cuando el servicio de mensajería esté disponible
  // Por ahora, la funcionalidad de mensajería no está disponible
  const chats: Message[] = []

  const filteredChats = chats.filter((chat) => chat.name.toLowerCase().includes(searchQuery.toLowerCase()))

  if (chats.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-neutral-400">
          La funcionalidad de mensajería estará disponible próximamente.
        </p>
        <p className="text-neutral-500 text-sm mt-2">
          Requiere implementación del servicio de mensajería en el backend.
        </p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-neutral-800">
      {filteredChats.map((chat) => (
        <button
          key={chat.id}
          onClick={() => onSelectChat(chat.id)}
          className={`w-full p-4 text-left transition-colors hover:bg-neutral-800/50 ${
            selectedChat === chat.id ? "bg-neutral-800/80 border-l-2 border-blue-500" : ""
          }`}
        >
          <div className="flex items-start gap-3">
            <div className="relative flex-shrink-0">
              <img
                src={chat.avatar || "/placeholder.svg"}
                alt={chat.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              {chat.online && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-neutral-900"></div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold text-white truncate">{chat.name}</h3>
                <span className="text-xs text-neutral-400 ml-2 flex-shrink-0">
                  {formatDistanceToNow(chat.timestamp, {
                    addSuffix: false,
                    locale: es,
                  })}
                </span>
              </div>
              <p className="text-sm text-neutral-400 truncate">{chat.lastMessage}</p>
            </div>

            {chat.unread > 0 && (
              <div className="flex-shrink-0 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-xs font-semibold text-white">{chat.unread}</span>
              </div>
            )}
          </div>
        </button>
      ))}
    </div>
  )
}
