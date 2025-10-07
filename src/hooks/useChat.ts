"use client"

import { useState, useEffect, useCallback } from 'react'

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

interface Chat {
  id: number
  name: string
  lastMessage: string
  time: string
  unread: number
}

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [activeChat, setActiveChat] = useState<Chat | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [editingMessage, setEditingMessage] = useState<number | null>(null)
  const [replyingTo, setReplyingTo] = useState<Message | null>(null)

  const sendMessage = useCallback(() => {
    if (!newMessage.trim()) return

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

    setTimeout(() => updateMessageStatus(message.id, 'delivered'), 1000)
    setTimeout(() => updateMessageStatus(message.id, 'read'), 2000)
  }, [newMessage, replyingTo])

  const editMessage = useCallback((messageId: number, newText: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, text: newText, isEdited: true }
        : msg
    ))
    setEditingMessage(null)
  }, [])

  const deleteMessage = useCallback((messageId: number) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId))
  }, [])

  const pinMessage = useCallback((messageId: number) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, isPinned: !msg.isPinned }
        : msg
    ))
  }, [])

  const starMessage = useCallback((messageId: number) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, isStarred: !msg.isStarred }
        : msg
    ))
  }, [])

  const addReaction = useCallback((messageId: number, emoji: string) => {
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
  }, [])

  const updateMessageStatus = useCallback((messageId: number, status: 'sent' | 'delivered' | 'read') => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, status } : msg
    ))
  }, [])

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
    msg.text.toLowerCase().includes(searchQuery.toLowerCase())
  )

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

  useEffect(() => {
    if (activeChat) {
      const timer = setTimeout(() => setIsTyping(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [activeChat])

  return {
    messages: filteredMessages,
    activeChat,
    newMessage,
    isTyping,
    isOnline,
    searchQuery,
    editingMessage,
    replyingTo,
    setActiveChat,
    setNewMessage,
    setSearchQuery,
    setEditingMessage,
    setReplyingTo,
    sendMessage,
    editMessage,
    deleteMessage,
    pinMessage,
    starMessage,
    addReaction,
    groupMessages,
    extractMentions
  }
}