import { fetchRedis } from '@/helpers/redis'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { addFriendValidator } from '@/lib/validations/add-friend'
import { getServerSession } from 'next-auth'
import { z } from 'zod'

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const { email: emailToAdd } = addFriendValidator.parse(body.email)

    const idToAdd = await fetchRedis('get', `user:email:${emailToAdd}`)

    if (!idToAdd) {
      return new Response('this person does not exist.', { status: 400 })
    }
    const session = await getServerSession(authOptions)
    if (!session) {
      return new Response('Unauthorized', { status: 401 })
    }

    if (idToAdd === session.user.id) {
      return new Response('You cannot can not add yourself', { status: 400 })
    }

    // Check if user is already added
    const isAlreadyAdded = (await fetchRedis(
      'sismember',
      `user:${idToAdd}:incoming_friend_requests`,
      session.user.id
    )) as 0 | 1

    if (isAlreadyAdded) {
      return new Response('Already added this user', { status: 400 })
    }

    // check if user is already a friend
    const isAlreadyFriend = (await fetchRedis(
      'sismember',
      `user:${session.user.id}:friends`,
      idToAdd
    )) as 0 | 1

    if (isAlreadyFriend) {
      return new Response('This user is already your friend', { status: 400 })
    }

    // valid request, send friend request

    db.sadd(`user:${idToAdd}:incoming_friend_requests`, session.user.id)

    return new Response('OK')
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response('Invalid request payload', { status: 422 })
    }

    return new Response('Invalid request', { status: 400 })
  }
}
