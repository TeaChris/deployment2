'use client'

import { useAuthStore } from '@/store'
import { useEffect, useState } from 'react'

export default function Home() {
  const { user } = useAuthStore()

  const [isMounted, setIsMounted] = useState<boolean>(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null
  }

  console.log({ user: user?.email })
  return <h1 className="text-7xl font-bold">{user?.email}</h1>
}
