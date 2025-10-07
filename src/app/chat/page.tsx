"use client"
import React, { useState, useRef, useEffect } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card } from "@/components/ui/card"
import { 
  MoreVertical, 
  Search, 
  Smile, 
  Paperclip, 
  Mic, 
  Send, 
  Phone, 
  Video, 
  Menu,
  X,
  Settings,
  LogOut,
  MessageCircle,
  Users,
  Bell
} from "lucide-react"

interface Chat {
  id: number
  name: string
  lastMessage: string
  time: string
  unread: number
  avatar?: string
  status: 'online' | 'offline' | 'away'
}

interface Message {
  id: number
  text: string
  sent: boolean
  time: string
  status?: 'sent' | 'delivered' | 'read'
}

const chats: Chat[] = [
  { id: 1, name: "Alice Johnson", lastMessage: "See you tomorrow!", time: "10:30 PM", unread: 0, status: 'online' },
  { id: 2, name: "Bob Smith", lastMessage: "How's the project going?", time: "9:15 PM", unread: 2, status: 'online' },
  { id: 3, name: "Charlie Brown", lastMessage: "Let's catch up soon", time: "Yesterday", unread: 0, status: 'away' },
  { id: 4, name: "David Wilson", lastMessage: "Thanks for the help!", time: "Yesterday", unread: 1, status: 'offline' },
  { id: 5, name: "Eva Martinez", lastMessage: "Movie night on Friday?", time: "Wednesday", unread: 0, status: 'online' },
  { id: 6, name: "Frank Davis", lastMessage: "Great work on the presentation!", time: "Tuesday", unread: 0, status: 'offline' },
  { id: 7, name: "Grace Lee", lastMessage: "Can we reschedule?", time: "Monday", unread: 3, status: 'away' },
]

const messages: Message[] = [
  { id: 1, text: "Hey there! How are you doing?", sent: false, time: "10:00 AM", status: 'read' },
  { id: 2, text: "Hi! I'm doing great, thanks for asking! How about you?", sent: true, time: "10:02 AM", status: 'read' },
  { id: 3, text: "I'm good too, thanks! Just working on some new projects. Really excited about them.", sent: false, time: "10:03 AM", status: 'read' },
  { id: 4, text: "That sounds awesome! I'd love to hear more about it sometime.", sent: true, time: "10:05 AM", status: 'read' },
  { id: 5, text: "Absolutely! Maybe we can grab coffee this weekend and I can tell you all about it. What do you think?", sent: false, time: "10:07 AM", status: 'read' },
  { id: 6, text: "That sounds perfect! I know a great place downtown. Saturday afternoon work for you?", sent: true, time: "10:10 AM", status: 'delivered' },
]

export default function ChatPage() {
  const [activeChat, setActiveChat] = useState<Chat | null>(chats[0])
  const [newMessage, setNewMessage] = useState("")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = () => {
    if (newMessage.trim()) {
      // Here you would typically send the message to a backend
      console.log("Sending message:", newMessage)
      setNewMessage("")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const filteredChats = chats.filter(chat => 
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500'
      case 'away': return 'bg-yellow-500'
      case 'offline': return 'bg-gray-400'
      default: return 'bg-gray-400'
    }
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50
        w-80 lg:w-96 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
        flex flex-col transition-transform duration-300 ease-in-out
      `}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src="/api/placeholder/40/40" alt="User" />
                <AvatarFallback className="bg-blue-500 text-white">JD</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="font-semibold text-gray-900 dark:text-white">John Doe</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Online</p>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 lg:hidden" onClick={() => setSidebarOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input 
              className="pl-10 bg-gray-100 dark:bg-gray-700 border-0" 
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Chat List */}
        <ScrollArea className="flex-1">
          <div className="p-2">
            {filteredChats.map((chat) => (
              <div
                key={chat.id}
                className={`
                  flex items-center p-3 rounded-lg cursor-pointer transition-colors
                  hover:bg-gray-100 dark:hover:bg-gray-700
                  ${activeChat?.id === chat.id ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500' : ''}
                `}
                onClick={() => {
                  setActiveChat(chat)
                  setSidebarOpen(false)
                }}
              >
                <div className="relative">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={`/api/placeholder/48/48`} alt={chat.name} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white">
                      {chat.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(chat.status)}`} />
                </div>
                
                <div className="ml-3 flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-medium text-gray-900 dark:text-white truncate">{chat.name}</h3>
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">{chat.time}</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 truncate mt-1">{chat.lastMessage}</p>
                </div>
                
                {chat.unread > 0 && (
                  <div className="bg-blue-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs font-medium ml-2">
                    {chat.unread > 99 ? '99+' : chat.unread}
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {activeChat ? (
          <>
            {/* Chat Header */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="lg:hidden"
                    onClick={() => setSidebarOpen(true)}
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                  
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={`/api/placeholder/40/40`} alt={activeChat.name} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white">
                        {activeChat.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(activeChat.status)}`} />
                  </div>
                  
                  <div>
                    <h2 className="font-semibold text-gray-900 dark:text-white">{activeChat.name}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{activeChat.status}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="icon" className="text-gray-600 dark:text-gray-300">
                    <Phone className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-gray-600 dark:text-gray-300">
                    <Video className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-gray-600 dark:text-gray-300">
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4 bg-gray-50 dark:bg-gray-900">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sent ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex items-end space-x-2 max-w-[70%] ${message.sent ? 'flex-row-reverse space-x-reverse' : ''}`}>
                      {!message.sent && (
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={`/api/placeholder/32/32`} alt={activeChat.name} />
                          <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white text-xs">
                            {activeChat.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      
                      <div className={`
                        px-4 py-2 rounded-2xl shadow-sm
                        ${message.sent 
                          ? 'bg-blue-500 text-white rounded-br-md' 
                          : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-md'
                        }
                      `}>
                        <p className="text-sm leading-relaxed">{message.text}</p>
                        <div className={`flex items-center justify-end mt-1 space-x-1 ${message.sent ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'}`}>
                          <span className="text-xs">{message.time}</span>
                          {message.sent && message.status && (
                            <div className="flex">
                              <div className={`w-1 h-1 rounded-full ${message.status === 'read' ? 'bg-blue-200' : 'bg-blue-300'}`} />
                              <div className={`w-1 h-1 rounded-full ml-0.5 ${message.status === 'read' ? 'bg-blue-200' : 'bg-blue-300'}`} />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-end space-x-3">
                <Button variant="ghost" size="icon" className="text-gray-500 dark:text-gray-400 mb-1">
                  <Paperclip className="h-5 w-5" />
                </Button>
                
                <div className="flex-1 relative">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    className="pr-12 py-3 rounded-full border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
                  />
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400"
                  >
                    <Smile className="h-5 w-5" />
                  </Button>
                </div>
                
                <Button 
                  onClick={handleSend}
                  disabled={!newMessage.trim()}
                  className={`rounded-full p-3 transition-all ${
                    newMessage.trim() 
                      ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {newMessage.trim() ? <Send className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400">
            <MessageCircle className="h-16 w-16 mb-4 text-gray-300 dark:text-gray-600" />
            <h3 className="text-xl font-medium mb-2">Welcome to Chat</h3>
            <p className="text-center max-w-md">
              Select a conversation from the sidebar to start messaging, or search for someone new to chat with.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}