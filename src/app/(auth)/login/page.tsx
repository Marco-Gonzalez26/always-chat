'use client'

import GoogleIcon from '@/components/icons/Google'
import Button from '@/components/ui/Button'
import { FC, useState } from 'react'
import { signIn } from 'next-auth/react'
import { toast } from 'react-hot-toast'
import { Icons } from '@/components/icons/Icons'
interface LoginProps {}

const Login: FC<LoginProps> = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const loginWithGoogle = async () => {
    setIsLoading(true)
    try {
      await signIn('google')
    } catch (error) {
      toast.error('Something went wrong with your login')
    } finally {
      setIsLoading(false)
    }
  }
  return (
    <>
      <div className='flex min-h-full items-center justify-center py-12 px-4 sm:px-6 lg:px-8'>
        <div className='w-full flex flex-col items-center max-w-md space-y-8'>
          <div className='flex flex-col items-center gap-8'>
            <h1 className='mt-6 text-center text-3xl font-bold tracking-tight text-gray-900 flex gap-x-2 items-center'>
              <Icons.Logo className='h-8 w-auto text-indigo-600 shrink-0' />
              Always Chat
            </h1>
            <h2 className='mt-6 text-center text-2xl font-bold tracking-tight text-gray-900'>
              Sign in to your account or create a new one
            </h2>
          </div>
          <Button
            isLoading={isLoading}
            type='button'
            className='max-w-sm mx-auto w-full'
            onClick={loginWithGoogle}>
            {isLoading ? null : <GoogleIcon className='mr-2' />}
            Google
          </Button>
        </div>
      </div>
    </>
  )
}

export default Login
