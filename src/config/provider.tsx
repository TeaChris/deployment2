'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { ReactNode, useState } from 'react'
import HydrationWrapper from './hydration'

type Props = {
  children: ReactNode
}

export default function Providers({ children }: Props) {
  // const [queryClient] = useState(
  //   () =>
  //     new QueryClient({
  //       defaultOptions: {
  //         queries: {
  //           staleTime: 60 * 1000, // 1 minute
  //         },
  //       },
  //     })
  // )

  const [queryClient] = useState(() => new QueryClient())

  return (
    <HydrationWrapper>
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster duration={8000} position={'top-center'} richColors />
      </QueryClientProvider>
    </HydrationWrapper>
  )
}
