'use client'

import { buttonVariants, Loader } from '@/components'
import { useApiMutation } from '@/config'
import { IUser } from '@/types'

import { toast } from 'sonner'
import { ArrowRight } from 'lucide-react'

import { useEffect } from 'react'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

const Page = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const { mutate } = useApiMutation<IUser, string>(
    ['verifyEmail'],
    '/auth/verify-email',
    'POST',
    token ?? undefined,
    {
      onSuccess: () => {
        toast.success('Email verified successfully')
        router.push('/sign-in')
      },
      onError: (error) => {
        toast.error(error.message)
      },
    }
  )

  useEffect(() => {
    if (token) {
      mutate(token)
    }
  }, [token, mutate])

  return (
    <>
      <div className="container relative flex pt-20 flex-col items-center justify-center lg:px-0">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col items-center space-y-2 text-center">
            <div className="text-2xl font-extrabold text-primary">
              🚀 Flash.
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {token ? 'Verifying your email...' : 'Verify your email.'}
            </h1>

            {!token ? (
              <p className="text-sm text-muted-foreground">
                We sent a verification link to your email.
              </p>
            ) : (
              <div className="flex flex-col items-center justify-center gap-2">
                <p className="text-sm text-muted-foreground">
                  Do not refresh or close this page!
                </p>

                <Loader />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default Page
