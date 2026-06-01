import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { DEMO_USER, DEMO_ADMIN } from './mock-data'

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: 'Demo',
      credentials: {
        email: { label: 'Email', type: 'email' },
      },
      async authorize(credentials) {
        const email = (credentials?.email as string | undefined)?.toLowerCase().trim()
        if (!email) return null

        if (email === DEMO_ADMIN.email) {
          return {
            id: DEMO_ADMIN.id,
            email: DEMO_ADMIN.email,
            name: DEMO_ADMIN.name,
            role: DEMO_ADMIN.role,
          }
        }

        // Any other email logs in as the demo employee
        return {
          id: DEMO_USER.id,
          email: email,
          name: DEMO_USER.name,
          role: DEMO_USER.role,
        }
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
        // @ts-expect-error role is added in authorize
        token.role = user.role
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
    error: '/login?error=true',
  },
})
