export interface User {
  name: string
  email: string
  id: string
  image: string
}

export interface Chat {
  id: string
  messages: Message[]
}

export interface Message {
  id: string
  senderId: string
  receiverId: string
  text: string
  timestamp: number
}

interface FriendRequest {
  id: string
  senderId: string
  receiverId: string
}
