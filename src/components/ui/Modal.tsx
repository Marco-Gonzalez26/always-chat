import { Fragment, useState, FC, SetStateAction, Dispatch } from 'react'
import Image from 'next/image'
import { Dialog, Transition } from '@headlessui/react'
import { ArrowLeft, Send } from 'lucide-react'
import Button from './Button'

const Modal: FC<{
  imageUrl: string
  setImageUrl: Dispatch<string>
  sendMessage: () => Promise<void>
}> = ({ imageUrl, setImageUrl, sendMessage }) => {
  const [isOpen, setIsOpen] = useState(true)

  function closeModal() {
    setIsOpen(false)
    setImageUrl('')
  }

  return (
    <>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as='div' className='relative z-10' onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter='ease-out duration-300'
            enterFrom='opacity-0'
            enterTo='opacity-100'
            leave='ease-in duration-200'
            leaveFrom='opacity-100'
            leaveTo='opacity-0'>
            <div className='fixed inset-0 bg-black bg-opacity-25' />
          </Transition.Child>

          <div className='fixed inset-0 overflow-y-auto'>
            <div className='flex min-h-full items-center justify-center p-4 text-center'>
              <Transition.Child
                as={Fragment}
                enter='ease-out duration-300'
                enterFrom='opacity-0 scale-95'
                enterTo='opacity-100 scale-100'
                leave='ease-in duration-200'
                leaveFrom='opacity-100 scale-100'
                leaveTo='opacity-0 scale-95'>
                <Dialog.Panel className='w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all'>
                  <Dialog.Title
                    as='h3'
                    className='text-lg font-medium leading-6 text-gray-900'>
                    Upload Image
                  </Dialog.Title>
                  <div className='mt-2 relative h-full w-full rounded'>
                    <Image
                      src={imageUrl}
                      alt='uploaded image'
                      fill
                      referrerPolicy='no-referrer'
                      className='object-contain rounded'
                    />
                  </div>

                  <div className='mt-4 w-full flex items-center justify-between flex-row-reverse'>
                    <Button
                      type='button'
                      onClick={() => {
                        sendMessage()
                        closeModal()
                      }}>
                      <Send className='h-6 w-6 text-white' />
                    </Button>
                    <Button type='button' onClick={closeModal}>
                      <ArrowLeft className='h-6 w-6 text-white' />
                    </Button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  )
}

export default Modal
