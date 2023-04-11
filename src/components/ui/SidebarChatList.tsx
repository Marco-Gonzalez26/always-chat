'use client'

import { FC, useEffect, useState } from 'react'
import { Message, User } from '@/types/db'
import { usePathname, useRouter } from 'next/navigation'
import { chatHrefConstructor } from '@/lib/utils'
import Image from 'next/image'

interface SidebarChatListProps {
  friends: User[]
  sessionId: string
}

const SidebarChatList: FC<SidebarChatListProps> = ({ friends, sessionId }) => {
  const router = useRouter()
  const pathname = usePathname()
  const [unseenMessages, setUnseenMessages] = useState<Message[]>([])

  useEffect(() => {
    if (pathname?.includes('chat')) {
      setUnseenMessages((prev) => {
        return prev.filter((msg) => !pathname.includes(msg.senderId))
      })
    }
  }, [pathname])

  console.log({ friends })
  return (
    <ul role='list' className='max-h-[25rem] overflow-y-auto -mx-2 space-y-1'>
      {friends.sort().map((friend) => {
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
                <div className='bg-indigo-600 font-medium text-xs text-white w-4 h-4 rounded-full flex justify-center items-center'>
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
