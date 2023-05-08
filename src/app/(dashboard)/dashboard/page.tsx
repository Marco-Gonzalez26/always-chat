import { getFriendsByUserId } from '@/helpers/get-friends-by-user-id'
import { fetchRedis } from '@/helpers/redis'
import { authOptions } from '@/lib/auth'
import { chatHrefConstructor } from '@/lib/utils'
import { Message } from '@/lib/validations/messages'
import { ChevronRight } from 'lucide-react'
import { getServerSession } from 'next-auth'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

const Dashboard = async () => {
  const session = await getServerSession(authOptions)

  if (!session) notFound()

  const friends = await getFriendsByUserId(session.user.id)

  const friendsWithLastMessage = await Promise.all(
    friends.map(async (friend) => {
      const messagesFromDb = (await fetchRedis(
        'zrange',
        `chat:${chatHrefConstructor(session.user.id, friend.id)}:messages`,
        -1,
        -1
      )) as string[]
      console.log({ messagesFromDb })
      if (messagesFromDb.length !== 0) {
        const lastMessage = JSON.parse(messagesFromDb[0]) as Message
        return { ...friend, lastMessage }
      }
    })
  )
  return (
    <div className='container py-12'>
      <h1 className='font-bold text-2xl lg:text-5xl mb-8'>Recent chats</h1>
      {friendsWithLastMessage.length === 0 ? (
        <p className='text-zinc-500 text-sm'>Nothing to show here</p>
      ) : (
        friendsWithLastMessage
          .filter((friend) => friend !== undefined)
          .map((friend) => {
            return (
              <div
                key={friend?.id}
                className='relative bg-zinc-50 border border-zinc-200 p-3 rounded-md'>
                <div className='absolute right-4 inset-y-0 flex items-center'>
                  <ChevronRight className='h-7 w-7 text-zinc-400' />
                </div>
                <Link
                  href={`/dashboard/chat/${chatHrefConstructor(
                    session.user.id,
                    friend?.id
                  )}`}
                  className='relative sm:flex'>
                  <div className='mb-4 flex-shrink-0 sm:mb-0 sm:mr-4 items-center'>
                    <div className='relative h-12 w-12'>
                      {friend?.image && (
                        <Image
                          referrerPolicy='no-referrer'
                          className='rounded-full'
                          alt={`${friend?.name} profile picture`}
                          fill
                          src={friend?.image}
                        />
                      )}
                    </div>
                  </div>
                  <div>
                    <h4 className='text-lg font-semibold'>{friend?.name}</h4>
                    <p className='mt-1 max-w-md flex gap-x-1'>
                      <span className='text-zinc-400'>
                        {friend?.lastMessage.senderId === session.user.id
                          ? 'You: '
                          : ''}
                      </span>
                      <span className='text-zinc-700 font-semibold'>
                        {friend?.lastMessage.text}
                        {friend?.lastMessage.chatImage ? (
                          <section className='flex gap-x-1'>
                            <div className='relative w-6 h-6 rounded'>
                              <Image
                                src={friend.lastMessage.chatImage}
                                className='w-4 blur-[0.5px]'
                                alt={`Image from ${friend.name}`}
                                referrerPolicy='no-referrer'
                                fill
                            
                              />
                            </div>
                              <p>Image</p>
                          </section>
                        ) : (
                          ''
                        )}
                      </span>
                    </p>
                  </div>
                </Link>
              </div>
            )
          })
      )}
    </div>
  )
}

export default Dashboard
