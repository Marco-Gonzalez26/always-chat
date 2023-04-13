import Providers from '@/components/ui/Providers'
import './globals.css'

export const metadata = {
  title: 'Always Chat',
  description: 'Chat with your friends and family!'
}

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang='en'>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
