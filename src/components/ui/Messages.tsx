'use client'

import { classNames, toPusherKey } from '@/lib/utils'
import { Message } from '@/lib/validations/messages'
import { FC, useEffect, useRef, useState } from 'react'
import { format } from 'date-fns'
import Image from 'next/image'
import { User } from '@/types/db'
import { pusherClient } from '@/lib/pusher'
interface MessagesProps {
  initialMessages: Message[]
  sessionId: string
  sessionName: string | null | undefined
  sessionImg: string | null | undefined
  chatPartner: User
  chatId: string
}

const Messages: FC<MessagesProps> = ({
  initialMessages,
  sessionId,
  sessionName,
  sessionImg,
  chatPartner,
  chatId
}) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const scrollDownRef = useRef<HTMLDivElement | null>(null)

  const formatTimestamp = (timestamp: number) => {
    return format(timestamp, 'hh:mm aaa')
  }

  useEffect(() => {
    pusherClient.subscribe(toPusherKey(`chat:${chatId}`))

    const messageHandler = (message: Message) => {
      setMessages((prev) => [message, ...prev])
    }

    pusherClient.bind('incoming_message', messageHandler)
    return () => {
      pusherClient.unsubscribe(toPusherKey(`chat:${chatId}`))
      pusherClient.unbind('incoming_message', messageHandler)
    }
  }, [chatId])

  return (
    <div
      id='messages'
      className=' h-full flex flex-col-reverse flex-1 gap-4 p-3 overflow-y-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch'>
      <div ref={scrollDownRef} />

      {messages.map((message, index) => {
        const isCurrentUser = message.senderId === sessionId

        const hasNextMessageFromSameUser =
          messages[index - 1]?.senderId === messages[index].senderId

        return (
          <div
            className='chat-message'
            key={`${message.id}-${message.timestamp}`}>
            <div
              className={classNames('flex items-end', {
                'justify-end': isCurrentUser
              })}>
              <div
                className={classNames(
                  'flex flex-col space-y-2 text-base ,ax-w-xs mx-2',
                  {
                    'order-1 items-end': isCurrentUser,
                    'order-2 items-start': !isCurrentUser
                  }
                )}>
                <span
                  className={classNames(
                    'px-4 py-2 rounded-lg inline-block max-w-xs',
                    {
                      'bg-indigo-600 text-white': isCurrentUser,
                      'bg-gray-200 text-gray-900': !isCurrentUser,
                      'rounded-br-none':
                        !hasNextMessageFromSameUser && isCurrentUser,
                      'rounded-bl-none':
                        !hasNextMessageFromSameUser && !isCurrentUser
                    }
                  )}>
                  {message.text}{' '}
                  <span
                    className={classNames('ml-2 text-xs', {
                      'text-gray-400': !isCurrentUser,
                      'text-white': isCurrentUser
                    })}>
                    {formatTimestamp(message.timestamp)}
                  </span>
                </span>
              </div>
              <div
                className={classNames('relative w-6 h-6', {
                  'order-2': isCurrentUser,
                  'order-1': !isCurrentUser,
                  invisible: hasNextMessageFromSameUser
                })}>
                <Image
                  fill
                  src={
                    isCurrentUser ? (sessionImg as string) : chatPartner.image
                  }
                  alt={
                    isCurrentUser
                      ? `${sessionName} profile picture`
                      : `${chatPartner.name} profile picture`
                  }
                  className='rounded-full'
                  referrerPolicy='no-referrer'
                />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default Messages
