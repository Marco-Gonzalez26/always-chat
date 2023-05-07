import { fetchRedis } from '@/helpers/redis'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { pusherServer } from '@/lib/pusher'
import { toPusherKey } from '@/lib/utils'
import { Message, messageValidator } from '@/lib/validations/messages'
import { nanoid } from 'nanoid'
import { User, getServerSession } from 'next-auth'

export async function POST(req: Request) {
  try {
    const { text, chatId, chatImage } = await req.json()
    const session = await getServerSession(authOptions)

    if (!session) return new Response('Unauthorized', { status: 401 })

    const [userId1, userId2] = chatId.split('--')

    if (session.user.id !== userId1 && session.user.id !== userId2) {
      return new Response('Unauthorized', { status: 401 })
    }

    const friendId = session.user.id === userId1 ? userId2 : userId1

    const friendList = (await fetchRedis(
      'smembers',
      `user:${session.user.id}:friends`
    )) as string[]
    const isFriend = friendList.includes(friendId)

    if (!isFriend) return new Response('Unauthorized', { status: 401 })

    const senderFromDb = await fetchRedis('get', `user:${session.user.id}`)
    const sender = JSON.parse(senderFromDb) as User

    const timestamp = Date.now()
    const messageData: Message = {
      id: nanoid(),
      senderId: session.user.id,
      text,
      timestamp,
      chatImage
    }

    const message = messageValidator.parse(messageData)

    // notify all connected chat members
    pusherServer.trigger(
      toPusherKey(`chat:${chatId}`),
      'incoming_message',
      message
    )

    pusherServer.trigger(toPusherKey(`user:${friendId}:chats`), 'new_message', {
      ...message,
      senderPicture: sender.image,
      senderName: sender.name
    })
    // all valid, send the message

    await db.zadd(`chat:${chatId}:messages`, {
      score: timestamp,
      member: JSON.stringify(message)
    })
    return new Response('OK')
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message)
      return new Response(error.message, { status: 500 })
    }
    return new Response('Internal Server Error', { status: 500 })
  }
}
