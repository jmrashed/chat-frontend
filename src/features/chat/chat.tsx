"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertCircle,
  Mic,
  MoreVertical,
  Paperclip,
  Search,
  Send,
  Smile,
  File,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import React, { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";

declare module "next-auth" {
  interface Session {
    accessToken: string;
  }
}

interface Chat {
  id: number;
  name: string;
  lastMessage: string;
  time: string;
  unread: number;
  _id: string;
}

interface Message {
  id: number;
  content: string;
  sender: { email: string; username: string };
  timestamp: string;
  room: string;
  fileId?: string;
  fileName?: string;
  fileType?: string;
  senderName?: string;
}

export default function Chat() {
  const [action, setAction] = useState<"create" | "join">("create");
  const [roomName, setRoomName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: session } = useSession();

  useEffect(() => {
    if (session?.accessToken) {
      const socketIo = io(`${process.env.SOCKET_API_URL}`, {
        query: { token: session.accessToken },
        transports: ["websocket", "polling"],
      });

      socketIo.on("connect", () => {
        // console.log("Socket connected:", socketIo.id);
        setError(null);
      });

      socketIo.emit("room list", (chatList: Chat[]) => {
        setChats(chatList);
      });

      socketIo.on("connect_error", (err) => {
        if (err.message === "AUTHENTICATION_ERROR") {
          signOut();
        }
        console.error("Connection failed:", err.message);
        setError("Failed to connect to chat server.");
      });

      socketIo.on("error", (errorMessage) => {
        setError(errorMessage);
      });

      socketIo.on("new message", (message: Message) => {
        setMessages((prevMessages) => [...prevMessages, message]);
      });

      setSocket(socketIo);

      return () => {
        socketIo.disconnect();
      };
    }
  }, [session]);

  useEffect(() => {
    if (socket && activeChat) {
      socket.emit("join room", activeChat.name);
      socket.emit(
        "get messages",
        activeChat._id,
        0,
        (fetchedMessages: Message[]) => {
          // console.log("Fetched messages:", fetchedMessages);

          setMessages(fetchedMessages);
        }
      );
    }
  }, [socket, activeChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!roomName.trim()) {
      setError("Room name cannot be empty");
      return;
    }

    if (socket) {
      if (action === "create") {
        socket.emit("create room", { name: roomName });
        alert(`Successfully created room: ${roomName}`);
      } else {
        socket.emit("join room", roomName);
        alert(`Successfully joined room: ${roomName}`);
      }
      setRoomName("");
    } else {
      setError("Socket connection is not established");
    }
  };

  const handleSend = () => {
    if (newMessage.trim() && socket && activeChat) {
      const messageData = {
        room: activeChat._id,
        message: newMessage,
      };
      socket.emit("chat message", messageData);
      setNewMessage("");
    }
  };

  console.log("messages",messages);
  

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; // Get the selected file
    if (file && socket && activeChat) {
      // console.log("Uploading file:", file);

      const reader = new FileReader();

      // Add error handling for the FileReader
      reader.onerror = () => {
        console.error("Error reading file");
        setError("Error reading file. Please try again.");
      };

      reader.onload = (e) => {
        const arrayBuffer = e.target?.result;

        // Check if result is an ArrayBuffer
        if (arrayBuffer instanceof ArrayBuffer) {
          const fileData = {
            room: activeChat._id,
            file: arrayBuffer, // Ensure file is passed as ArrayBuffer
            fileName: file.name,
            fileType: file.type,
          };
          // console.log("Uploading file data:", fileData);

          socket.emit(
            "file upload",
            fileData,
            (response: { error?: string; success?: boolean }) => {
              if (response.error) {
                setError(response.error);
                console.error("File upload error:", response.error);
              } else {
                // console.log("File uploaded successfully", response);
              }
            }
          );
        } else {
          console.error("File data is not valid");
          setError("Invalid file data. Please try again.");
        }
      };

      // Start reading the file as an ArrayBuffer
      reader.readAsArrayBuffer(file);
    } else {
      console.warn("No file selected or socket/activeChat is undefined");
    }
  };



  // const renderMessage = (message: Message) => {
  //   const isCurrentUser = message?.sender?.email === session?.user?.email;

  //   return (
  //     <div
  //       className={`flex mb-4 ${
  //         isCurrentUser ? "justify-end" : "justify-start"
  //       }`}
  //     >
  //       <div
  //         className={`max-w-[70%] p-3 rounded-lg ${
  //           isCurrentUser
  //             ? "bg-primary text-primary-foreground"
  //             : "bg-secondary text-secondary-foreground"
  //         }`}
  //       >
  //         <div className="font-semibold">{message?.sender.username}</div>

  //         {/* Display file or message content */}
  //         {message.fileId ? (
  //           <div className="flex items-center mt-1">
  //             <File className="mr-2" />
  //             <a
  //               href={`/api/files/${message.fileId}`}
  //               target="_blank"
  //               rel="noopener noreferrer"
  //               className="underline"
  //             >
  //               {message.fileName || "Attached File"}
  //             </a>
  //           </div>
  //         ) : (
  //           <div className="mt-1">{message.content}</div>
  //         )}

  //         {/* Display timestamp */}
  //         <div className="text-xs text-right mt-1 opacity-70">
  //           {new Date(message.timestamp).toLocaleTimeString()}
  //         </div>
  //       </div>
  //     </div>
  //   );
  // };
  const renderMessage = (message: Message) => {
    const isCurrentUser = message?.sender?.email === session?.user?.email;
  
    // Function to determine file extension
    const getFileExtension = (fileName: string) => {
      return fileName?.split('.').pop()?.toLowerCase();
    };
  
    const fileExtension = getFileExtension((message as any)?.fileUrl);
  
    return (
      <div
        className={`flex mb-4 ${
          isCurrentUser ? "justify-end" : "justify-start"
        }`}
      >
        <div
          className={`max-w-[70%] p-3 rounded-lg ${
            isCurrentUser
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground"
          }`}
        >
          <div className="font-semibold">{message?.sender.username}</div>
  
          {/* Display file or message content */}
          {message.fileId ? (
            <div className="flex items-center mt-1">
              <File className="mr-2" />
              <a
                href={`/api/files/${message.fileId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                {message.fileName || "Attached File"}
              </a>
            </div>
          ) : (message as any)?.fileUrl ? (
            // Check the file extension to render accordingly
            (fileExtension === 'jpg' || 
             fileExtension === 'jpeg' || 
             fileExtension === 'png' || 
             fileExtension === 'gif' || 
             fileExtension === 'webp') ? (
              <div className="mt-1">
                <img
                  src={(message as any)?.fileUrl}
                  alt={message.fileName || "Attached Image"}
                  className="max-w-full h-auto rounded-lg" // Adjust styles as needed
                />
              </div>
            ) : fileExtension === 'mp3' ? (
              <div className="mt-1">
                <audio controls>
                  <source src={(message as any)?.fileUrl} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              </div>
            ) : fileExtension === 'mp4' ? (
              <div className="mt-1">
                <video controls className="max-w-full h-auto rounded-lg">
                  <source src={(message as any)?.fileUrl} type="video/mp4" />
                  Your browser does not support the video element.
                </video>
              </div>
            ) : fileExtension === 'pdf' ? (
              <div className="mt-1">
                <a
                  href={(message as any)?.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  View PDF Document
                </a>
              </div>
            ) : (
              <div className="mt-1">
                <a
                  href={(message as any)?.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  {message.fileName || "Attached File"}
                </a>
              </div>
            )
          ) : (
            <div className="mt-1">{message.content}</div>
          )}
  
          {/* Display timestamp */}
          <div className="text-xs text-right mt-1 opacity-70">
            {new Date(message.timestamp).toLocaleTimeString()}
          </div>
        </div>
      </div>
    );
  };
  
  
  

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleSignOut = () => {
    signOut(); // Call the signOut function from NextAuth.js
    setIsDropdownOpen(false); // Close the dropdown after signing out
  };

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev); // Toggle dropdown visibility
  };

  return (
    <div className="flex h-screen  mx-auto border rounded-lg overflow-hidden bg-background">
      {/* Sidebar */}
      <div className="w-1/4 border-r flex flex-col">
        <div className="p-3 bg-secondary flex justify-between items-center">
        <p>{session?.user?.email}</p>
          <div className="relative flex space-x-2">
            <Button variant="ghost" size="icon" onClick={toggleDropdown}>
              <MoreVertical className="h-5 w-5" />
            </Button>
            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded shadow-lg z-10">
                <ul className="py-1">
                  <li>
                    <button
                      onClick={handleSignOut}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 w-full text-left"
                    >
                      Logout
                    </button>
                  </li>
                </ul>
              </div>
            )}
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
              key={chat._id}
              className={`flex items-center p-3 cursor-pointer hover:bg-accent ${
                activeChat?.id === chat.id ? "bg-accent" : ""
              }`}
              onClick={() => setActiveChat(chat)}
            >
              <Avatar className="h-12 w-12">
                <AvatarFallback>{chat.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="ml-3 flex-1 overflow-hidden">
                <div className="flex justify-between items-baseline">
                  <span className="font-semibold">{chat.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {chat.time}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  {chat.lastMessage}
                </p>
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
                  <AvatarFallback>{activeChat.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="ml-3 font-semibold">{activeChat.name}</span>
              </div>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </div>
            <ScrollArea className="flex-1 p-4">
              {messages.map((message, index) => (
                <React.Fragment key={index}>
                  {renderMessage(message)}
                </React.Fragment>
              ))}
              <div ref={messagesEndRef} />
            </ScrollArea>
            <div className="p-3 bg-background flex items-center">
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground"
              >
                <Smile className="h-6 w-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground"
                onClick={() => fileInputRef.current?.click()}
              >
                <Paperclip className="h-6 w-6" />
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileUpload}
              />
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                placeholder="Type a message"
                className="flex-1 mx-2"
              />
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground"
                onClick={handleSend}
              >
                {newMessage ? (
                  <Send className="h-6 w-6" />
                ) : (
                  <Mic className="h-6 w-6" />
                )}
              </Button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <Card className="w-full max-w-lg mx-auto">
              <CardHeader>
                <CardTitle>Chat Rooms</CardTitle>
                <CardDescription>
                  Create a new chat room or join an existing one.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit}>
                  <div className="space-y-4">
                    <RadioGroup
                      defaultValue="create"
                      onValueChange={(value: "create" | "join") =>
                        setAction(value)
                      }
                    >
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
                        placeholder={
                          action === "create"
                            ? "Enter new room name"
                            : "Enter room name to join"
                        }
                        value={roomName}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setRoomName(e.target.value)
                        }
                      />
                    </div>
                  </div>
                  {error && (
                    <Alert variant="destructive" className="mt-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  <Button type="submit" className="w-full mt-4">
                    {action === "create" ? "Create Room" : "Join Room"}
                  </Button>
                </form>

                <div className="mt-4">
                  <CardTitle>Messages</CardTitle>
                  <div className="space-y-2">
                    {messages.map((msg, index) => (
                      <div key={index} className="p-2 bg-gray-100 rounded-md">
                        {msg.content}{" "}
                        {/* Display the text property of the Message */}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="text-sm text-muted-foreground">
                {action === "create"
                  ? "Creating a new room will make you the admin."
                  : "You'll need the exact room name to join an existing room."}
              </CardFooter>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
