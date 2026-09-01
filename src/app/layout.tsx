import type { Metadata } from 'next'
import { Roboto } from 'next/font/google'
import './globals.css'

const roboto = Roboto({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['300', '400', '500', '700'],
})

export const metadata: Metadata = {
  title: 'Four Bros HR Portal',
  description: 'Interní HR portál společnosti Four Bros',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="cs">
      <body className={`${roboto.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}
