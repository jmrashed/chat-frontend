"use client"
import React, { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MoreVertical, Search, Smile, Paperclip, Mic, Send } from "lucide-react"

interface Chat {
  id: number
  name: string
  lastMessage: string
  time: string
  unread: number
}

interface Message {
  id: number
  text: string
  sent: boolean
  time: string
}

const chats: Chat[] = [
  { id: 1, name: "Alice", lastMessage: "See you tomorrow!", time: "10:30 PM", unread: 0 },
  { id: 2, name: "Bob", lastMessage: "How's the project going?", time: "9:15 PM", unread: 2 },
  { id: 3, name: "Charlie", lastMessage: "Let's catch up soon", time: "Yesterday", unread: 0 },
  { id: 4, name: "David", lastMessage: "Thanks for the help!", time: "Yesterday", unread: 1 },
  { id: 5, name: "Eva", lastMessage: "Movie night on Friday?", time: "Wednesday", unread: 0 },
]

const messages: Message[] = [
  { id: 1, text: "Hey there!", sent: false, time: "10:00 AM" },
  { id: 2, text: "Hi! How are you?", sent: true, time: "10:02 AM" },
  { id: 3, text: "I'm good, thanks! How about you?", sent: false, time: "10:03 AM" },
  { id: 4, text: "Doing well, thanks for asking!", sent: true, time: "10:05 AM" },
  { id: 5, text: "That's great to hear. Any plans for the weekend?", sent: false, time: "10:07 AM" },
  { id: 6, text: "Not yet, but I'm thinking about going hiking. You?", sent: true, time: "10:10 AM" },
]

export default function Component() {
  const [activeChat, setActiveChat] = useState<Chat | null>(null)
  const [newMessage, setNewMessage] = useState("")

  const handleSend = () => {
    if (newMessage.trim()) {
      // Here you would typically send the message to a backend
      // console.log("Sending message:", newMessage)
      setNewMessage("")
    }
  }

  return (
    <div className="flex h-screen max-w-6xl mx-auto border rounded-lg overflow-hidden bg-background">
      {/* Sidebar */}
      <div className="w-1/3 border-r flex flex-col">
        <div className="p-3 bg-secondary flex justify-between items-center">
          <Avatar>
            <AvatarImage src="/placeholder.svg?height=40&width=40" alt="User" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
          <div className="flex space-x-2">
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </div>
        </div>
        <div className="p-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input className="pl-8" placeholder="Search or start new chat" />
          </div>
        </div>
        <ScrollArea className="flex-grow">
          {chats.map((chat) => (
            <div
              key={chat.id}
              className={`flex items-center p-3 cursor-pointer hover:bg-accent ${
                activeChat?.id === chat.id ? 'bg-accent' : ''
              }`}
              onClick={() => setActiveChat(chat)}
            >
              <Avatar className="h-12 w-12">
                <AvatarImage src={`/placeholder.svg?height=48&width=48&text=${chat.name.charAt(0)}`} alt={chat.name} />
                <AvatarFallback>{chat.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="ml-3 flex-1 overflow-hidden">
                <div className="flex justify-between items-baseline">
                  <span className="font-semibold">{chat.name}</span>
                  <span className="text-xs text-muted-foreground">{chat.time}</span>
                </div>
                <p className="text-sm text-muted-foreground truncate">{chat.lastMessage}</p>
              </div>
              {chat.unread > 0 && (
                <div className="bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center text-xs ml-2">
                  {chat.unread}
                </div>
              )}
            </div>
          ))}
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {activeChat ? (
          <>
            <div className="p-3 bg-secondary flex items-center justify-between">
              <div className="flex items-center">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={`/placeholder.svg?height=40&width=40&text=${activeChat.name.charAt(0)}`} alt={activeChat.name} />
                  <AvatarFallback>{activeChat.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="ml-3 font-semibold">{activeChat.name}</span>
              </div>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </div>
            <ScrollArea className="flex-1 p-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex mb-4 ${message.sent ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] p-3 rounded-lg ${
                      message.sent
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-secondary-foreground'
                    }`}
                  >
                    {message.text}
                    <div className="text-xs text-right mt-1 opacity-70">{message.time}</div>
                  </div>
                </div>
              ))}
            </ScrollArea>
            <div className="p-3 bg-background flex items-center">
              <Button variant="ghost" size="icon" className="text-muted-foreground">
                <Smile className="h-6 w-6" />
              </Button>
              <Button variant="ghost" size="icon" className="text-muted-foreground">
                <Paperclip className="h-6 w-6" />
              </Button>
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message"
                className="flex-1 mx-2"
              />
              <Button variant="ghost" size="icon" className="text-muted-foreground" onClick={handleSend}>
                {newMessage ? <Send className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
              </Button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            Select a chat to start messaging
          </div>
        )}
      </div>
    </div>
  )
}