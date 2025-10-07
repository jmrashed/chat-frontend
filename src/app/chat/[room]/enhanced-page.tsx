"use client"
import React, { useState, useEffect, useRef } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { MessageBubble } from "@/components/chat/MessageBubble"
import { TypingIndicator } from "@/components/chat/TypingIndicator"
import { MessageSearch } from "@/components/chat/MessageSearch"
import { MoreVertical, Search, Smile, Paperclip, Mic, Send, Phone, Video, Settings, Pin } from "lucide-react"

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
  sender: string
  avatar?: string
  status?: 'sent' | 'delivered' | 'read'
  reactions?: { emoji: string; users: string[]; count: number }[]
  replyTo?: number
  isEdited?: boolean
  isPinned?: boolean
  isStarred?: boolean
  mentions?: string[]
}

const chats: Chat[] = [
  { id: 1, name: "Alice", lastMessage: "See you tomorrow!", time: "10:30 PM", unread: 0 },
  { id: 2, name: "Bob", lastMessage: "How's the project going?", time: "9:15 PM", unread: 2 },
  { id: 3, name: "Charlie", lastMessage: "Let's catch up soon", time: "Yesterday", unread: 0 },
  { id: 4, name: "David", lastMessage: "Thanks for the help!", time: "Yesterday", unread: 1 },
  { id: 5, name: "Eva", lastMessage: "Movie night on Friday?", time: "Wednesday", unread: 0 },
]

const initialMessages: Message[] = [
  { id: 1, text: "Hey there! 👋", sent: false, time: "10:00 AM", sender: "Alice", status: 'read', reactions: [{ emoji: '👋', users: ['You'], count: 1 }] },
  { id: 2, text: "How's your day going?", sent: false, time: "10:01 AM", sender: "Alice", status: 'read' },
  { id: 3, text: "Hi @Alice! How are you?", sent: true, time: "10:02 AM", sender: "You", status: 'read', mentions: ['Alice'] },
  { id: 4, text: "I'm good, thanks! How about you?", sent: false, time: "10:03 AM", sender: "Alice", status: 'read', replyTo: 3 },
  { id: 5, text: "Doing well, thanks for asking!", sent: true, time: "10:05 AM", sender: "You", status: 'delivered', reactions: [{ emoji: '❤️', users: ['Alice'], count: 1 }] },
  { id: 6, text: "That's great to hear. Any plans for the weekend?", sent: false, time: "10:07 AM", sender: "Alice", status: 'read', isPinned: true },
  { id: 7, text: "Not yet, but I'm thinking about going hiking. You?", sent: true, time: "10:10 AM", sender: "You", status: 'sent', isStarred: true },
]

export default function EnhancedChatPage() {
  const [activeChat, setActiveChat] = useState<Chat | null>(chats[0])
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [newMessage, setNewMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [editingMessage, setEditingMessage] = useState<number | null>(null)
  const [replyingTo, setReplyingTo] = useState<Message | null>(null)
  const [showSearch, setShowSearch] = useState(false)
  const [showPinned, setShowPinned] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (activeChat) {
      const timer = setTimeout(() => setIsTyping(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [activeChat])

  const groupMessages = (messages: Message[]) => {
    const grouped: Message[][] = []
    let currentGroup: Message[] = []
    
    messages.forEach((message, index) => {
      if (index === 0 || message.sender !== messages[index - 1].sender) {
        if (currentGroup.length > 0) grouped.push(currentGroup)
        currentGroup = [message]
      } else {
        currentGroup.push(message)
      }
    })
    
    if (currentGroup.length > 0) grouped.push(currentGroup)
    return grouped
  }

  const handleSend = () => {
    if (newMessage.trim()) {
      const message: Message = {
        id: Date.now(),
        text: newMessage,
        sent: true,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sender: 'You',
        status: 'sent',
        replyTo: replyingTo?.id,
        mentions: extractMentions(newMessage)
      }
      
      setMessages(prev => [...prev, message])
      setNewMessage("")
      setReplyingTo(null)
      setIsTyping(true)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
    if (e.key === 'Escape') {
      setReplyingTo(null)
      setEditingMessage(null)
    }
  }

  const handleEdit = (messageId: number, newText: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, text: newText, isEdited: true }
        : msg
    ))
  }

  const handleDelete = (messageId: number) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId))
  }

  const handlePin = (messageId: number) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, isPinned: !msg.isPinned }
        : msg
    ))
  }

  const handleStar = (messageId: number) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, isStarred: !msg.isStarred }
        : msg
    ))
  }

  const handleReaction = (messageId: number, emoji: string) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id !== messageId) return msg

      const reactions = msg.reactions || []
      const existingReaction = reactions.find(r => r.emoji === emoji)

      if (existingReaction) {
        const hasUserReacted = existingReaction.users.includes('You')
        if (hasUserReacted) {
          return {
            ...msg,
            reactions: reactions.map(r => 
              r.emoji === emoji 
                ? { ...r, users: r.users.filter(u => u !== 'You'), count: r.count - 1 }
                : r
            ).filter(r => r.count > 0)
          }
        } else {
          return {
            ...msg,
            reactions: reactions.map(r => 
              r.emoji === emoji 
                ? { ...r, users: [...r.users, 'You'], count: r.count + 1 }
                : r
            )
          }
        }
      } else {
        return {
          ...msg,
          reactions: [...reactions, { emoji, users: ['You'], count: 1 }]
        }
      }
    }))
  }

  const extractMentions = (text: string): string[] => {
    const mentionRegex = /@(\w+)/g
    const mentions: string[] = []
    let match
    while ((match = mentionRegex.exec(text)) !== null) {
      mentions.push(match[1])
    }
    return mentions
  }

  const filteredMessages = messages.filter(msg => 
    searchQuery ? msg.text.toLowerCase().includes(searchQuery.toLowerCase()) : true
  )

  const pinnedMessages = messages.filter(msg => msg.isPinned)

  return (
    <div className="flex h-screen max-w-7xl mx-auto border border-border/40 rounded-xl overflow-hidden bg-background shadow-2xl transition-all duration-300">
      {/* Sidebar */}
      <div className="w-full md:w-1/3 border-r border-border/40 flex flex-col bg-muted/30">
        <div className="p-4 bg-background/80 backdrop-blur-sm border-b border-border/40 flex justify-between items-center">
          <Avatar>
            <AvatarImage src="/placeholder.svg?height=40&width=40" alt="User" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
          <div className="flex space-x-2">
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="p-3 space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input className="pl-10 h-10 bg-background/60 border-border/40 rounded-full transition-all duration-200 focus:bg-background" placeholder="Search conversations" />
          </div>
        </div>

        <ScrollArea className="flex-grow">
          {chats.map((chat) => (
            <div
              key={chat.id}
              className={`flex items-center p-3 mx-2 rounded-xl cursor-pointer transition-all duration-200 hover:bg-accent/60 hover:shadow-sm ${
                activeChat?.id === chat.id ? 'bg-accent shadow-sm scale-[0.98]' : ''
              }`}
              onClick={() => setActiveChat(chat)}
            >
              <div className="relative">
                <Avatar className="h-12 w-12 ring-2 ring-background shadow-sm">
                  <AvatarImage src={`/placeholder.svg?height=48&width=48&text=${chat.name.charAt(0)}`} alt={chat.name} />
                  <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/40 text-primary font-semibold">{chat.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 border-2 border-background rounded-full"></div>
              </div>
              <div className="ml-3 flex-1 overflow-hidden">
                <div className="flex justify-between items-baseline">
                  <span className="font-semibold">{chat.name}</span>
                  <span className="text-xs text-muted-foreground">{chat.time}</span>
                </div>
                <p className="text-sm text-muted-foreground truncate">{chat.lastMessage}</p>
              </div>
              {chat.unread > 0 && (
                <Badge className="bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center text-xs ml-2 animate-pulse">
                  {chat.unread}
                </Badge>
              )}
            </div>
          ))}
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-gradient-to-b from-background to-muted/20 relative">
        {showSearch && (
          <MessageSearch
            messages={messages}
            onMessageSelect={(id) => console.log('Navigate to message', id)}
            onClose={() => setShowSearch(false)}
          />
        )}

        {activeChat ? (
          <>
            <div className="p-4 bg-background/80 backdrop-blur-sm border-b border-border/40 flex items-center justify-between shadow-sm">
              <div className="flex items-center">
                <div className="relative">
                  <Avatar className="h-10 w-10 ring-2 ring-background shadow-sm">
                    <AvatarImage src={`/placeholder.svg?height=40&width=40&text=${activeChat.name.charAt(0)}`} alt={activeChat.name} />
                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/40 text-primary font-semibold">{activeChat.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  {isOnline && <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-background rounded-full"></div>}
                </div>
                <div className="ml-3">
                  <div className="font-semibold">{activeChat.name}</div>
                  <div className="text-xs text-muted-foreground">{isOnline ? 'Online' : 'Last seen recently'}</div>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <Button variant="ghost" size="icon" className="hover:bg-accent/60" onClick={() => setShowSearch(true)}>
                  <Search className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="hover:bg-accent/60" onClick={() => setShowPinned(!showPinned)}>
                  <Pin className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="hover:bg-accent/60">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="hover:bg-accent/60">
                  <Video className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="hover:bg-accent/60">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Pinned Messages */}
            {showPinned && pinnedMessages.length > 0 && (
              <div className="p-3 bg-muted/20 border-b border-border/40">
                <div className="text-sm font-medium mb-2 flex items-center">
                  <Pin className="h-4 w-4 mr-1" />
                  Pinned Messages
                </div>
                <div className="space-y-1">
                  {pinnedMessages.map(msg => (
                    <div key={msg.id} className="text-sm p-2 bg-background/60 rounded border">
                      <span className="font-medium">{msg.sender}:</span> {msg.text.slice(0, 50)}...
                    </div>
                  ))}
                </div>
              </div>
            )}

            <ScrollArea className="flex-1 p-4 space-y-4">
              {groupMessages(filteredMessages).map((group, groupIndex) => (
                <div key={groupIndex} className={`flex flex-col space-y-1 ${group[0].sent ? 'items-end' : 'items-start'}`}>
                  {!group[0].sent && (
                    <div className="flex items-center space-x-2 mb-2">
                      <Avatar className="h-8 w-8 ring-2 ring-background shadow-sm">
                        <AvatarImage src={`/placeholder.svg?height=32&width=32&text=${group[0].sender.charAt(0)}`} alt={group[0].sender} />
                        <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/40 text-primary text-xs font-semibold">{group[0].sender.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium text-muted-foreground">{group[0].sender}</span>
                    </div>
                  )}
                  {group.map((message, messageIndex) => (
                    <MessageBubble
                      key={message.id}
                      message={message}
                      replyToMessage={message.replyTo ? messages.find(m => m.id === message.replyTo) : undefined}
                      isEditing={editingMessage === message.id}
                      onEdit={handleEdit}
                      onReply={setReplyingTo}
                      onDelete={handleDelete}
                      onPin={handlePin}
                      onStar={handleStar}
                      onReaction={handleReaction}
                      onEditStart={setEditingMessage}
                      onEditCancel={() => setEditingMessage(null)}
                    />
                  ))}
                </div>
              ))}
              
              {isTyping && (
                <TypingIndicator userName={activeChat.name} />
              )}
              
              <div ref={messagesEndRef} />
            </ScrollArea>

            <div className="p-4 bg-background/80 backdrop-blur-sm border-t border-border/40">
              {replyingTo && (
                <div className="mb-3 p-2 bg-muted/50 rounded-lg border-l-4 border-primary">
                  <div className="flex items-center justify-between">
                    <div className="text-sm">
                      <span className="text-muted-foreground">Replying to </span>
                      <span className="font-medium">{replyingTo.sender}</span>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => setReplyingTo(null)}>
                      ×
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{replyingTo.text}</p>
                </div>
              )}
              
              <div className="flex items-center space-x-2 bg-muted/30 rounded-full p-2 shadow-sm">
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:bg-accent/60 rounded-full">
                  <Smile className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:bg-accent/60 rounded-full">
                  <Paperclip className="h-5 w-5" />
                </Button>
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={replyingTo ? `Reply to ${replyingTo.sender}...` : "Type a message..."}
                  className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/60"
                />
                <Button 
                  variant={newMessage ? "default" : "ghost"} 
                  size="icon" 
                  className={`rounded-full transition-all duration-200 ${
                    newMessage 
                      ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm' 
                      : 'text-muted-foreground hover:bg-accent/60'
                  }`}
                  onClick={handleSend}
                >
                  {newMessage ? <Send className="h-4 w-4" /> : <Mic className="h-5 w-5" />}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground space-y-4">
            <div className="w-24 h-24 rounded-full bg-muted/40 flex items-center justify-center">
              <Search className="h-12 w-12 text-muted-foreground/40" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Welcome to ChatApp</h3>
              <p className="text-sm text-muted-foreground">Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}