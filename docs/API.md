# API Documentation

## Authentication Endpoints

### POST /api/auth/signin
Sign in a user with credentials.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "User Name"
  },
  "token": "jwt_token"
}
```

### POST /api/auth/signup
Register a new user.

**Request Body:**
```json
{
  "name": "User Name",
  "email": "user@example.com",
  "password": "password123"
}
```

## Socket.io Events

### Client to Server Events

#### `join_room`
Join a chat room.
```javascript
socket.emit('join_room', { roomId: 'room_123', userId: 'user_456' })
```

#### `send_message`
Send a message to a room.
```javascript
socket.emit('send_message', {
  roomId: 'room_123',
  message: 'Hello, world!',
  userId: 'user_456'
})
```

### Server to Client Events

#### `message_received`
Receive a new message.
```javascript
socket.on('message_received', (data) => {
  // data: { id, message, userId, userName, timestamp, roomId }
})
```

#### `user_joined`
User joined the room.
```javascript
socket.on('user_joined', (data) => {
  // data: { userId, userName, roomId }
})
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXTAUTH_URL` | Base URL for NextAuth | Yes |
| `NEXTAUTH_SECRET` | Secret for NextAuth | Yes |
| `SOCKET_SERVER_URL` | Socket.io server URL | Yes |