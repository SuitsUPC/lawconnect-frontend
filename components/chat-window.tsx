"use client"

import { useState } from "react"
import { Send, Phone, Video, Info } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface Message {
  id: string
  sender: "me" | "them"
  text: string
  timestamp: Date
}

interface ChatWindowProps {
  chatId: string
}

export default function ChatWindow({ chatId }: ChatWindowProps) {
  // TODO: Conectar con el backend cuando el servicio de mensajería esté disponible
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message: Message = {
        id: Date.now().toString(),
        sender: "me",
        text: newMessage,
        timestamp: new Date(),
      }
      setMessages([...messages, message])
      setNewMessage("")
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-neutral-800 p-4 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-white">Chat</h3>
          <p className="text-sm text-neutral-400">Funcionalidad no disponible</p>
        </div>
        <div className="flex items-center gap-2">
          <button disabled className="p-2 rounded-lg transition-colors opacity-50 cursor-not-allowed">
            <Phone className="w-5 h-5 text-neutral-400" />
          </button>
          <button disabled className="p-2 rounded-lg transition-colors opacity-50 cursor-not-allowed">
            <Video className="w-5 h-5 text-neutral-400" />
          </button>
          <button disabled className="p-2 rounded-lg transition-colors opacity-50 cursor-not-allowed">
            <Info className="w-5 h-5 text-neutral-400" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-neutral-400">No hay mensajes aún</p>
              <p className="text-neutral-500 text-sm mt-2">
                Funcionalidad requiere servicio de mensajería en el backend
              </p>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  msg.sender === "me"
                    ? "bg-blue-500 text-white rounded-br-none"
                    : "bg-neutral-800 text-neutral-100 rounded-bl-none"
                }`}
              >
                <p className="text-sm">{msg.text}</p>
                <p className={`text-xs mt-1 ${msg.sender === "me" ? "text-blue-100" : "text-neutral-400"}`}>
                  {msg.timestamp.toLocaleTimeString("es-ES", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input */}
      <div className="border-t border-neutral-800 p-4">
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Escribe tu mensaje..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            className="flex-1 bg-neutral-800 border-neutral-700 text-white placeholder-neutral-500"
          />
          <Button onClick={handleSendMessage} className="button-primary px-4">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
