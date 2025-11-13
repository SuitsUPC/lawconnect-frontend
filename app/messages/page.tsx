"use client"

import { useState } from "react"
import Navbar from "@/components/navbar"
import MessagesList from "@/components/messages-list"
import ChatWindow from "@/components/chat-window"
import { Input } from "@/components/ui/input"
import { Search, Plus } from "lucide-react"

function MessagesPage() {
  const [selectedChat, setSelectedChat] = useState("1")
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="bg-background min-h-screen">
      <Navbar />
      <div className="pt-20 h-[calc(100vh-80px)] flex overflow-hidden">
        {/* Messages List */}
        <div className="w-full md:w-96 border-r border-neutral-800 flex flex-col bg-neutral-900/50">
          <div className="p-4 border-b border-neutral-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Mensajes</h2>
              <button className="p-2 hover:bg-neutral-800 rounded-lg transition-colors">
                <Plus className="w-5 h-5 text-blue-400" />
              </button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <Input
                type="text"
                placeholder="Buscar conversaciones..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-neutral-800 border-neutral-700 text-white placeholder-neutral-500"
              />
            </div>
          </div>

          {/* Chats */}
          <div className="flex-1 overflow-y-auto">
            <MessagesList selectedChat={selectedChat} onSelectChat={setSelectedChat} searchQuery={searchQuery} />
          </div>
        </div>

        {/* Chat Window */}
        <div className="hidden md:flex flex-1 flex-col">
          {selectedChat ? (
            <ChatWindow chatId={selectedChat} />
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-neutral-400">Selecciona una conversación para comenzar</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MessagesPage
