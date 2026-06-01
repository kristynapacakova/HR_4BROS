import type { Metadata } from 'next'
import { Playfair_Display, Roboto } from 'next/font/google'
import './globals.css'

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-headline',
  weight: ['400', '600', '700'],
})

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
      <body className={`${playfairDisplay.variable} ${roboto.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}
