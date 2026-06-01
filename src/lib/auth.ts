import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import Email from 'next-auth/providers/nodemailer'
import { db } from './db'

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  providers: [
    Email({
      server: {
        host: process.env.EMAIL_SERVER_HOST || 'smtp.ethereal.email',
        port: Number(process.env.EMAIL_SERVER_PORT) || 587,
        auth: {
          user: process.env.EMAIL_SERVER_USER || '',
          pass: process.env.EMAIL_SERVER_PASSWORD || '',
        },
      },
      from: process.env.EMAIL_FROM || 'noreply@fourbros.cz',
      sendVerificationRequest: async ({ identifier, url, provider }) => {
        // In development, just log the magic link
        if (process.env.NODE_ENV === 'development') {
          console.log('\n=== Magic Link for', identifier, '===')
          console.log(url)
          console.log('==================\n')
          return
        }
        // In production, send via nodemailer
        const { createTransport } = await import('nodemailer')
        const transport = createTransport(provider.server)
        await transport.sendMail({
          to: identifier,
          from: provider.from,
          subject: 'Přihlášení do HR portálu Four Bros',
          text: `Přihlaste se do HR portálu Four Bros kliknutím na odkaz: ${url}`,
          html: `
            <div style="font-family: Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: #0E2337; padding: 24px; border-radius: 8px 8px 0 0;">
                <h1 style="color: white; font-family: 'Playfair Display', serif; margin: 0;">Four Bros HR</h1>
              </div>
              <div style="background: #ffffff; padding: 32px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
                <h2 style="color: #0E2337; margin-top: 0;">Přihlaste se do HR portálu</h2>
                <p style="color: #374151;">Klikněte na tlačítko níže pro přihlášení. Odkaz je platný 24 hodin.</p>
                <a href="${url}" style="display: inline-block; background: #7e17e0; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; margin: 16px 0;">
                  Přihlásit se
                </a>
                <p style="color: #6b7280; font-size: 14px;">Pokud jste tento e-mail nevyžádali, ignorujte jej.</p>
              </div>
            </div>
          `,
        })
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        // Fetch role from DB
        const dbUser = await db.user.findUnique({
          where: { email: user.email! },
          select: { id: true, role: true, name: true },
        })
        if (dbUser) {
          token.id = dbUser.id
          token.role = dbUser.role
          token.name = dbUser.name
        }
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
    verifyRequest: '/login?verify=true',
    error: '/login?error=true',
  },
})
