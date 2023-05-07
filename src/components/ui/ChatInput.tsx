'use client'

import { User } from '@/types/db'
import { ChangeEvent, FC, useRef, useState } from 'react'
import TextAreaAutosize from 'react-textarea-autosize'
import Button from './Button'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import { ImagePlus, Send } from 'lucide-react'
import Modal from './Modal'
import { reader } from '../../helpers/utils'

interface ChatInputProps {
  chatPartner: User
  chatId: string
}

const ChatInput: FC<ChatInputProps> = ({ chatPartner, chatId }) => {
  const [input, setInput] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [imageUrl, setImageUrl] = useState<string | null>('')
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  const sendMessage = async () => {
    setIsLoading(true)

    if (!input && !imageUrl) {
      setIsLoading(false)
      return
    }

    try {
      await axios.post('/api/message/send', {
        text: input.trimEnd(),
        chatId,
        chatImage: imageUrl
      })
      setInput('')
      textareaRef.current?.focus()
    } catch (error) {
      toast.error('Something went wrong 😔. Please try again later')
    } finally {
      setIsLoading(false)
    }
  }
  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()

    try {
      const formData = new FormData()

      if (e.target.files) formData.append('file', e.target.files[0])
      formData.append('upload_preset', 'j6torjtd')
      formData.append('cloud_name', 'djhxsufha')

      const res = await axios.post(
        'https://api.cloudinary.com/v1_1/djhxsufha/upload',
        formData
      )

      setImageUrl(res.data.secure_url)
    } catch (e) {
      console.warn(e)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='relative border-t border-gray-200 p-4 mb-2 flex sm:mb-0'>
      {imageUrl ? (
        <Modal
          imageUrl={imageUrl}
          setImageUrl={setImageUrl}
          sendMessage={sendMessage}
        />
      ) : null}
      <div className='relative flex-1 overflow-hidden rounded-lg focus-within:ring-indigo-600'>
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
            <div className='h-9' />
          </div>
        </div>
      </div>
      <div className=' flex justify-between p-2'>
        <div className='flex shrink-0  flex-col gap-y-2'>
          <Button isLoading={isLoading} onClick={sendMessage} type='submit'>
            {!isLoading ? <Send className='text-white h-6 w-6' /> : null}
          </Button>
          <Button
            isLoading={isLoading}
            type='button'
            className='p-0 flex items-center justify-center'>
            <label
              htmlFor='file-upload'
              className=' flex  h-full w-full items-center justify-center'>
              {!isLoading ? <ImagePlus className='text-white h-6 w-6' /> : null}
              <input
                id='file-upload'
                name='files[]'
                type='file'
                accept='image/png, image/jpeg, image/jpg, image/svg'
                className='hidden pointer-events-none'
                onChange={handleImageUpload}
              />
            </label>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ChatInput
