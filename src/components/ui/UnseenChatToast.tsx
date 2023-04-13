import { FC } from 'react'
import { Toast, toast } from 'react-hot-toast'

import { chatHrefConstructor, classNames } from '@/lib/utils'
import Image from 'next/image'

interface UnseenChatToastProps {
  t: Toast
  sessionId: string
  senderId: string
  senderPicture: string
  senderName: string
  senderMessage: string
}

const UnseenChatToast: FC<UnseenChatToastProps> = ({
  t,
  sessionId,
  senderId,
  senderPicture,
  senderName,
  senderMessage
}) => {
  return (
    <div
      className={classNames(
        'max-w-md w-full shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5',
        {
          'animate-enter': t.visible,
          'animated-leave': !t.visible
        }
      )}>
      <a
        onClick={() => toast.dismiss(t.id)}
        href={`/dashboard/chat/${chatHrefConstructor(sessionId, senderId)}`}
        className='flex-1 w-0 p-4'>
        <div className='flex items-start'>
          <div className='flex-shrink-0 pt-0.5'>
            <div className='h-10 w-10 relative'>
              <Image
                src={senderPicture}
                fill
                referrerPolicy='no-referrer'
                alt={`${senderName} profile picture`}
                className='rounded-full'
              />
            </div>
          </div>
          <div className='ml-3 flex-1'>
            <p className='text-sm font-medium text-gray-900'>{senderName}</p>
            <p className='text-sm font-medium text-gray-500'>{senderMessage}</p>
          </div>
        </div>
      </a>
      <div
        className='flex border-l  border-gray-200'
        onClick={() => toast.dismiss(t.id)}>
        <button className='w-full border border-transparent rounded-none rounded-r-lg h-full p-4 flex items-center justify-center text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500'>
          Close
        </button>
      </div>
    </div>
  )
}

export default UnseenChatToast
