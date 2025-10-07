"use client"

import React, { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { MessageActions } from './MessageActions'
import { Pin, Star, Check, CheckCheck, Eye } from "lucide-react"

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

interface MessageBubbleProps {
  message: Message
  replyToMessage?: Message
  isEditing: boolean
  onEdit: (messageId: number, newText: string) => void
  onReply: (message: Message) => void
  onDelete: (messageId: number) => void
  onPin: (messageId: number) => void
  onStar: (messageId: number) => void
  onReaction: (messageId: number, emoji: string) => void
  onEditStart: (messageId: number) => void
  onEditCancel: () => void
}

export function MessageBubble({
  message,
  replyToMessage,
  isEditing,
  onEdit,
  onReply,
  onDelete,
  onPin,
  onStar,
  onReaction,
  onEditStart,
  onEditCancel
}: MessageBubbleProps) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [editText, setEditText] = useState(message.text)

  const renderMentions = (text: string) => {
    return text.replace(/@(\w+)/g, '<span class="text-primary font-semibold bg-primary/10 px-1 rounded">@$1</span>')
  }

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'sent': return <Check className="h-3 w-3" />
      case 'delivered': return <CheckCheck className="h-3 w-3" />
      case 'read': return <Eye className="h-3 w-3 text-primary" />
      default: return null
    }
  }

  const handleEditSubmit = () => {
    if (editText.trim() !== message.text) {
      onEdit(message.id, editText.trim())
    }
    onEditCancel()
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleEditSubmit()
    }
    if (e.key === 'Escape') {
      setEditText(message.text)
      onEditCancel()
    }
  }

  return (
    <div className="group relative">
      {/* Reply indicator */}
      {message.replyTo && replyToMessage && (
        <div className="text-xs text-muted-foreground mb-1 pl-3 border-l-2 border-primary/30">
          Replying to: {replyToMessage.text.slice(0, 50)}...
        </div>
      )}
      
      {/* Pin indicator */}
      {message.isPinned && (
        <div className="flex items-center space-x-1 text-xs text-primary mb-1">
          <Pin className="h-3 w-3" />
          <span>Pinned</span>
        </div>
      )}
      
      <div className={`relative p-3 rounded-2xl shadow-sm transition-all duration-200 hover:shadow-md ${
        message.sent
          ? 'bg-primary text-primary-foreground rounded-br-md'
          : 'bg-background border border-border/40 text-foreground rounded-bl-md'
      }`}>
        {/* Message actions */}
        <MessageActions
          message={message}
          onReply={onReply}
          onEdit={onEditStart}
          onDelete={onDelete}
          onPin={onPin}
          onStar={onStar}
          onReaction={onReaction}
          showEmojiPicker={showEmojiPicker}
          onEmojiPickerToggle={setShowEmojiPicker}
        />
        
        {/* Message content */}
        {isEditing ? (
          <Input
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onKeyDown={handleKeyPress}
            onBlur={handleEditSubmit}
            className="bg-transparent border-0 p-0 focus-visible:ring-0"
            autoFocus
          />
        ) : (
          <div 
            className="break-words" 
            dangerouslySetInnerHTML={{ __html: renderMentions(message.text) }}
          />
        )}
        
        {/* Message reactions */}
        {message.reactions && message.reactions.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {message.reactions.map((reaction, idx) => (
              <Button
                key={idx}
                variant="secondary"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={() => onReaction(message.id, reaction.emoji)}
              >
                {reaction.emoji} {reaction.count}
              </Button>
            ))}
          </div>
        )}
        
        {/* Message footer */}
        <div className={`flex items-center justify-between mt-2 text-xs opacity-70 ${
          message.sent ? 'flex-row-reverse' : 'flex-row'
        }`}>
          <div className="flex items-center space-x-1">
            <span>{message.time}</span>
            {message.isEdited && <span className="text-muted-foreground">(edited)</span>}
            {message.isStarred && <Star className="h-3 w-3 fill-current text-yellow-500" />}
          </div>
          {message.sent && getStatusIcon(message.status)}
        </div>
      </div>
    </div>
  )
}