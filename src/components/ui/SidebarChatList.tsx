'use client'
import { MessageCircle } from 'lucide-react'
import { FC, useEffect, useState } from 'react'
import { Message, User } from '@/types/db'
import { usePathname, useRouter } from 'next/navigation'
import { chatHrefConstructor, toPusherKey } from '@/lib/utils'
import Image from 'next/image'
import { pusherClient } from '@/lib/pusher'
import { toast } from 'react-hot-toast'
import UnseenChatToast from './UnseenChatToast'

interface SidebarChatListProps {
  friends: User[]
  sessionId: string
}

interface ExtendedMessage extends Message {
  senderName: string
  senderPicture: string
}
const SidebarChatList: FC<SidebarChatListProps> = ({ friends, sessionId }) => {
  const router = useRouter()
  const pathname = usePathname()
  const [unseenMessages, setUnseenMessages] = useState<Message[]>([])
  const [chats, setChats] = useState<User[]>(friends)
  useEffect(() => {
    pusherClient.subscribe(toPusherKey(`user:${sessionId}:chats`))
    pusherClient.subscribe(toPusherKey(`user:${sessionId}:friends`))

    const newFriendHandler = (newFriend: User) => {
      setChats((prev) => [...prev, newFriend])
    }

    const chatHandler = (message: ExtendedMessage) => {
      const shouldNotify =
        pathname !==
        `/dashboard/chat/${chatHrefConstructor(sessionId, message.senderId)}`
      if (!shouldNotify) return
      // should be notify
      toast.custom((t) => (
        // custom componenet
        <UnseenChatToast
          t={t}
          {...message}
          senderMessage={message.text}
          sessionId={sessionId}
        />
      ))

      setUnseenMessages((prev) => [...prev, message])
    }

    pusherClient.bind('new_message', chatHandler)
    pusherClient.bind('new_friend', newFriendHandler)

    return () => {
      pusherClient.unsubscribe(toPusherKey(`user:${sessionId}:chats`))
      pusherClient.unsubscribe(toPusherKey(`user:${sessionId}:friends`))

      pusherClient.unbind('new_message', chatHandler)
      pusherClient.unbind('new_friend', newFriendHandler)
    }
  }, [pathname, sessionId, router])

  useEffect(() => {
    if (pathname?.includes('chat')) {
      setUnseenMessages((prev) => {
        return prev.filter((msg) => !pathname.includes(msg.senderId))
      })
    }
  }, [pathname])

  return (
    <ul role='list' className='max-h-[25rem] overflow-y-auto -mx-2 space-y-1'>
      {chats.sort().map((friend) => {
        const unseenMessagesCount = unseenMessages.filter((unseenMessages) => {
          return unseenMessages.senderId === friend.id
        }).length

        return (
          <li
            key={friend.id}
            className=' hover:bg-slate-50 rounded-md p-2 transition-all'>
            <a
              href={`/dashboard/chat/${chatHrefConstructor(
                sessionId,
                friend.id
              )}`}
              className='flex items-center justify-start w-full  transition-all gap-x-2 font-medium text-gray-700 hover:text-indigo-600 group'>
              <div className='relative h-6 w-6 rounded-full leading-6 text-sm'>
                <Image
                  src={friend.image}
                  fill
                  alt={`${friend.name} profile picture`}
                  className='rounded-full'
                  referrerPolicy='no-referrer'
                />
              </div>
              {friend.name}
              {unseenMessagesCount > 0 ? (
                <div className='bg-indigo-600 font-medium text-[0.625rem] text-white w-4 h-4 rounded-full flex justify-center items-center p-2'>
                  {unseenMessagesCount}
                </div>
              ) : null}
            </a>
          </li>
        )
      })}
    </ul>
  )
}

export default SidebarChatList
