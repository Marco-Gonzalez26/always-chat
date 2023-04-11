import { getServerSession } from 'next-auth'
import { notFound } from 'next/navigation'
import { FC } from 'react'

import { authOptions } from '@/lib/auth'
import { fetchRedis } from '@/helpers/redis'
import { User } from '@/types/db'
import FriendRequests from '@/components/ui/FriendRequests'

interface FriendRequestsPageProps {}

const FriendRequestsPage = async () => {
  const session = await getServerSession(authOptions)

  if (!session) notFound()
  //ids of people who sent current logged in user a friend requests

  const incomingSenderIds = (await fetchRedis(
    'smembers',
    `user:${session.user.id}:incoming_friend_requests`
  )) as string[]

  const incomingFriendRequests = await Promise.all(
    incomingSenderIds.map(async (senderId) => {
      const senderResult = await fetchRedis('get', `user:${senderId}`)
      const sender = JSON.parse(senderResult) as User

      return {
        senderId,
        senderEmail: sender.email,
        senderName: sender.name,
        senderPicture: sender.image
      }
    })
  )

  return (
    <main className='pt-8'>
      <h1 className='font-bold text-5xl mb-8'></h1>
      <div className='flex flex-col gap-4'>
        <FriendRequests
          incomingFriendRequests={incomingFriendRequests}
          sessionId={session.user.id}
        />
      </div>
    </main>
  )
}

export default FriendRequestsPage
