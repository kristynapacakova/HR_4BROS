import type { Metadata } from 'next'
import './globals.css'

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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Funnel+Display:wght@300;400;500;600;700;800&family=Funnel+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400;1,700;1,800&display=swap"
        />
      </head>
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
