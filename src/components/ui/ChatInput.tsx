'use client'

import { User } from '@/types/db'
import { FC, useRef, useState } from 'react'
import TextAreaAutosize from 'react-textarea-autosize'
import Button from './Button'
import axios from 'axios'
import { toast } from 'react-hot-toast'

interface ChatInputProps {
  chatPartner: User
  chatId: string
}

const ChatInput: FC<ChatInputProps> = ({ chatPartner, chatId }) => {
  const [input, setInput] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  const sendMessage = async () => {
    setIsLoading(true)

    if (!input) {
      setIsLoading(false)
      return
    }
    try {
      await axios.post('/api/message/send', { text: input.trimEnd(), chatId })
      setInput('')
      textareaRef.current?.focus()
    } catch (error) {
      toast.error('Something went wrong 😔. Please try again later')
    } finally {
      setIsLoading(false)
    }
  }
  return (
    <div className='border-t border-gray-200 p-4 mb-2 sm:mb-0'>
      <div className='relative flex-1 overflow-hidden rounded-lg shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-indigo-600'>
        <TextAreaAutosize
          ref={textareaRef}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              if (!isLoading) {
                sendMessage()
              }
            }
          }}
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Message for ${chatPartner.name}`}
          className='block w-full resize-none border-0 bg-transparent text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:py-2 sm:px-2 leading-6'
        />
        <div
          onClick={() => textareaRef.current?.focus()}
          className='py-2 '
          aria-hidden='true'>
          <div className='py-px'>
            <div className='h-4' />
          </div>
        </div>
        <div className='absolute right-0 bottom-0 flex justify-between py-2 pl-3 pr-2'>
          <div className='flex shrink-0'>
            <Button isLoading={isLoading} onClick={sendMessage} type='submit'>
              Send
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatInput
