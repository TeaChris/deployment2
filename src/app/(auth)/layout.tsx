'use client'

import { useAuthStore } from '@/store'
import { redirect } from 'next/navigation'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user } = useAuthStore()

  if (user) return redirect('/')
  return <div className="w-full">{children}</div>
}
