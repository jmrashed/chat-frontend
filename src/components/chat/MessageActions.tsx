"use client"

import React from 'react'
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Reply, Smile, MoreVertical, Edit3, Trash2, Pin, Star, Copy, Forward } from "lucide-react"

interface Message {
  id: number
  text: string
  sent: boolean
  time: string
  sender: string
  isPinned?: boolean
  isStarred?: boolean
}

interface MessageActionsProps {
  message: Message
  onReply: (message: Message) => void
  onEdit: (messageId: number) => void
  onDelete: (messageId: number) => void
  onPin: (messageId: number) => void
  onStar: (messageId: number) => void
  onReaction: (messageId: number, emoji: string) => void
  showEmojiPicker: boolean
  onEmojiPickerToggle: (show: boolean) => void
}

const commonEmojis = ['❤️', '👍', '😂', '😮', '😢', '😡', '👏', '🔥']

export function MessageActions({
  message,
  onReply,
  onEdit,
  onDelete,
  onPin,
  onStar,
  onReaction,
  showEmojiPicker,
  onEmojiPickerToggle
}: MessageActionsProps) {
  const handleCopy = () => {
    navigator.clipboard.writeText(message.text)
  }

  return (
    <div className="absolute -top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="sm" variant="secondary" className="h-6 w-6 p-0" onClick={() => onReply(message)}>
              <Reply className="h-3 w-3" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Reply</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <Popover open={showEmojiPicker} onOpenChange={onEmojiPickerToggle}>
        <PopoverTrigger asChild>
          <Button size="sm" variant="secondary" className="h-6 w-6 p-0">
            <Smile className="h-3 w-3" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2">
          <div className="flex space-x-1">
            {commonEmojis.map(emoji => (
              <Button
                key={emoji}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-accent"
                onClick={() => onReaction(message.id, emoji)}
              >
                {emoji}
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" variant="secondary" className="h-6 w-6 p-0">
            <MoreVertical className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {message.sent && (
            <DropdownMenuItem onClick={() => onEdit(message.id)}>
              <Edit3 className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={() => onPin(message.id)}>
            <Pin className="h-4 w-4 mr-2" />
            {message.isPinned ? 'Unpin' : 'Pin'}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onStar(message.id)}>
            <Star className={`h-4 w-4 mr-2 ${message.isStarred ? 'fill-current' : ''}`} />
            {message.isStarred ? 'Unstar' : 'Star'}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleCopy}>
            <Copy className="h-4 w-4 mr-2" />
            Copy
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Forward className="h-4 w-4 mr-2" />
            Forward
          </DropdownMenuItem>
          {message.sent && (
            <DropdownMenuItem onClick={() => onDelete(message.id)} className="text-destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}