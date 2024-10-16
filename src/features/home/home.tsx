"use client";

import React, { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useSession } from 'next-auth/react'; // For NextAuth session to get JWT token

declare module "next-auth" {
  interface Session {
    accessToken: string; // Add the accessToken property
  }
}

export default function ChatHome() {
  const [action, setAction] = useState<'create' | 'join'>('create');
  const [roomName, setRoomName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<string[]>([]);
  const [messageInput, setMessageInput] = useState('');

  const { data: session } = useSession(); // Get session data from NextAuth

  useEffect(() => {
    if (session?.accessToken) {
      // console.log(`${process.env.SOCKET_API_URL}`);
      
      const socketIo = io(`${process.env.SOCKET_API_URL}`, {

        query: {
          token: session.accessToken, // Pass the JWT token from session
        },
        transports: ["websocket", "polling"],
      });

      socketIo.on('connect', () => {
        // console.log('Socket connected:', socketIo.id);
        setError(null);
      });

      socketIo.on('connect_error', (err) => {
        console.error('Connection failed:', err.message);
        setError('Failed to connect to chat server.');
      });

      socketIo.on('chat message', (message: string) => {
        setMessages((prevMessages) => [...prevMessages, message]);
      });

      socketIo.on('error', (errorMessage) => {
        setError(errorMessage);
      });

      setSocket(socketIo);

      return () => {
        socketIo.disconnect();
      };
    }
  }, [session]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!roomName.trim()) {
      setError('Room name cannot be empty');
      return;
    }

    if (socket) {
      if (action === 'create') {
        socket.emit('create room', { name: roomName }); // Emit create room event
        alert(`Successfully created room: ${roomName}`);
      } else {
        socket.emit('join room', roomName); // Emit join room event
        alert(`Successfully joined room: ${roomName}`);
      }
      setRoomName('');
    } else {
      setError('Socket connection is not established');
    }
  };



  return (
    <Card className="w-full max-w-md mx-auto mt-20">
      <CardHeader>
        <CardTitle>Chat Rooms</CardTitle>
        <CardDescription>Create a new chat room or join an existing one.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <RadioGroup defaultValue="create" onValueChange={(value: 'create' | 'join') => setAction(value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="create" id="create" />
                <Label htmlFor="create">Create a new room</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="join" id="join" />
                <Label htmlFor="join">Join an existing room</Label>
              </div>
            </RadioGroup>
            <div className="space-y-2">
              <Label htmlFor="room-name">Room Name</Label>
              <Input
                id="room-name"
                placeholder={action === 'create' ? 'Enter new room name' : 'Enter room name to join'}
                value={roomName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRoomName(e.target.value)}
              />
            </div>
          </div>
          {error && (
            <Alert variant="destructive" className="mt-4">
              < AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Button type="submit" className="w-full mt-4">
            {action === 'create' ? 'Create Room' : 'Join Room'}
          </Button>
        </form>

      

        <div className="mt-4">
          <CardTitle>Messages</CardTitle>
          <div className="space-y-2">
            {messages.map((msg, index) => (
              <div key={index} className="p-2 bg-gray-100 rounded-md">
                {msg}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter className="text-sm text-muted-foreground">
        {action === 'create'
          ? "Creating a new room will make you the admin."
          : "You'll need the exact room name to join an existing room."}
      </CardFooter>
    </Card>
  );
}
