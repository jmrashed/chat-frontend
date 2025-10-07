"use client"

import React, { useState } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, X, Calendar, User, Hash } from "lucide-react"

interface Message {
  id: number
  text: string
  sent: boolean
  time: string
  sender: string
  isPinned?: boolean
  isStarred?: boolean
}

interface MessageSearchProps {
  messages: Message[]
  onMessageSelect: (messageId: number) => void
  onClose: () => void
}

export function MessageSearch({ messages, onMessageSelect, onClose }: MessageSearchProps) {
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState<'all' | 'pinned' | 'starred'>('all')

  const filteredMessages = messages.filter(msg => {
    const matchesQuery = msg.text.toLowerCase().includes(query.toLowerCase()) ||
                        msg.sender.toLowerCase().includes(query.toLowerCase())
    
    switch (filter) {
      case 'pinned': return matchesQuery && msg.isPinned
      case 'starred': return matchesQuery && msg.isStarred
      default: return matchesQuery
    }
  })

  const highlightText = (text: string, query: string) => {
    if (!query) return text
    const regex = new RegExp(`(${query})`, 'gi')
    return text.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-800">$1</mark>')
  }

  return (
    <div className="absolute inset-0 bg-background/95 backdrop-blur-sm z-50 flex flex-col">
      <div className="p-4 border-b border-border/40">
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search messages..."
              className="pl-10"
              autoFocus
            />
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex space-x-2 mt-3">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All
          </Button>
          <Button
            variant={filter === 'pinned' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('pinned')}
          >
            <Hash className="h-3 w-3 mr-1" />
            Pinned
          </Button>
          <Button
            variant={filter === 'starred' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('starred')}
          >
            <Calendar className="h-3 w-3 mr-1" />
            Starred
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        {filteredMessages.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            {query ? 'No messages found' : 'Start typing to search messages'}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredMessages.map(message => (
              <div
                key={message.id}
                className="p-3 rounded-lg border border-border/40 hover:bg-accent cursor-pointer transition-colors"
                onClick={() => {
                  onMessageSelect(message.id)
                  onClose()
                }}
              >
                <div className="flex items-center space-x-2 mb-1">
                  <User className="h-3 w-3 text-muted-foreground" />
                  <span className="text-sm font-medium">{message.sender}</span>
                  <span className="text-xs text-muted-foreground">{message.time}</span>
                </div>
                <div 
                  className="text-sm"
                  dangerouslySetInnerHTML={{ 
                    __html: highlightText(message.text, query) 
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}