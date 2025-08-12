'use client'

import { useEffect, useState } from 'react'

export default function HydrationWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  const [isHydrated, setIsHydrated] = useState(false)

  // Wait till Next.js rehydration completes
  useEffect(() => {
    setIsHydrated(true)
  }, [])

  return isHydrated ? <>{children}</> : null
}
