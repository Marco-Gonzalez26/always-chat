import Button from '@/components/ui/Button'
import { User } from 'lucide-react'
import Link from 'next/link'

export default async function Home() {
  return (
    <Button size='lg' variant='default'>
      <Link href='/login' className='w-full h-full'>
        <User />
        Login
      </Link>
    </Button>
  )
}
