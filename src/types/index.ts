import type { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: string
    } & DefaultSession['user']
  }
}

export type UserRole = 'ADMIN' | 'TL' | 'EMPLOYEE'

export type LeaveType = 'ANNUAL' | 'SICK' | 'PERSONAL' | 'UNPAID'

export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export type DocumentType = 'CONTRACT' | 'ID' | 'PAYSLIP' | 'OTHER'

export interface NavItem {
  label: string
  href: string
  icon: string
  adminOnly?: boolean
}
