'use client'

import { pusherClient } from '@/lib/pusher'
import { toPusherKey } from '@/lib/utils'
import axios from 'axios'
import { X } from 'lucide-react'
import { Check } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { FC, useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'

interface FriendRequestsProps {
  incomingFriendRequests: IncomingFriendRequest[]
  sessionId: string
}

const FriendRequests: FC<FriendRequestsProps> = ({
  incomingFriendRequests,
  sessionId
}) => {
  const router = useRouter()
  const [friendRequests, setFriendRequests] = useState<IncomingFriendRequest[]>(
    incomingFriendRequests
  )
  useEffect(() => {
    pusherClient.subscribe(
      toPusherKey(`user:${sessionId}:incoming_friend_requests`)
    )
    const friendRequestHandler = (data: IncomingFriendRequest) => {
      setFriendRequests((prev) => [...prev, { ...data }])
    }
    pusherClient.bind('incoming_friend_requests', friendRequestHandler)
    return () => {
      pusherClient.unsubscribe(
        toPusherKey(`user:${sessionId}:incoming_friend_requests`)
      )
      pusherClient.unbind('incoming_friend_requests', friendRequestHandler)
    }
  }, [sessionId])



  const acceptFriend = async (senderId: string) => {
    await axios.post('/api/friends/accept', { id: senderId })

    setFriendRequests((prev) => prev.filter((req) => req.senderId !== senderId))

    router.refresh()
  }

  const denyFriend = async (senderId: string) => {
    await axios.post('/api/friends/deny', { id: senderId })

    setFriendRequests((prev) => prev.filter((req) => req.senderId !== senderId))

    router.refresh()
  }

  return (
    <>
      {friendRequests.length === 0 ? (
        <p className='text-sm text-zinc-500 '>Nothing to show here 😓</p>
      ) : (
        friendRequests.map((request) => {
          return (
            <div
              key={request.senderId}
              className='flex gap-4 items-center border rounded-lg p-2'>
              <div className='relative rounded-full h-10 w-10'>
                <Image
                  src={request.senderPicture}
                  alt={`${request.senderName} profile picture`}
                  fill
                  referrerPolicy='no-referrer'
                  className='rounded-full '
                />
              </div>
              <div className='flex flex-col '>
                <p className='font-medium text-lg'>{request.senderName}</p>

                <p className='font-medium text-xs text-gray-500'>
                  {request.senderEmail}
                </p>
              </div>
              <button
                aria-label='accept friend'
                className='w-8 h-8 bg-indigo-600 hover:bg-indigo-700 grid place-items-center rounded-full transition-all hover:shadow-medium'
                onClick={() => acceptFriend(request.senderId)}>
                <Check className='font-semibold text-white w-3/4 h-3/4' />
              </button>

              <button
                aria-label='reject friend'
                className='w-8 h-8 bg-zinc-600 hover:bg-zinc-700 grid place-items-center rounded-full transition-all hover:shadow-medium'
                onClick={() => denyFriend(request.senderId)}>
                <X className='font-semibold text-white w-3/4 h-3/4' />
              </button>
            </div>
          )
        })
      )}
    </>
  )
}

export default FriendRequests
