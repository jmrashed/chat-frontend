"use client"

import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface TypingIndicatorProps {
  userName: string
  userAvatar?: string
}

export function TypingIndicator({ userName, userAvatar }: TypingIndicatorProps) {
  return (
    <div className="flex items-center space-x-2 animate-in slide-in-from-bottom-2 duration-300">
      <Avatar className="h-8 w-8 ring-2 ring-background shadow-sm">
        <AvatarImage src={userAvatar || `/placeholder.svg?height=32&width=32&text=${userName.charAt(0)}`} alt={userName} />
        <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/40 text-primary text-xs font-semibold">
          {userName.charAt(0)}
        </AvatarFallback>
      </Avatar>
      <div className="bg-background border border-border/40 rounded-2xl rounded-bl-md p-3 shadow-sm">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
        </div>
      </div>
    </div>
  )
}