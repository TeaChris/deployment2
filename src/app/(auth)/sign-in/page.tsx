'use client'

import { IUser } from '@/types'
import { useApiMutation } from '@/config'
import { cn, signInSchema, TSignInSchema } from '@/utils'
import { Button, buttonVariants, Input, Label } from '@/components'

import { toast } from 'sonner'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuthStore } from '@/store/auth'

const Page = () => {
  const router = useRouter()
  const { setUser } = useAuthStore()

  const {
    reset,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TSignInSchema>({
    resolver: zodResolver(signInSchema),
  })

  const { mutate, isPending } = useApiMutation<IUser, TSignInSchema>(
    ['signIn'],
    '/auth/signin',
    'POST',
    undefined,
    {
      onSuccess: (data) => {
        toast.success('Signed in successfully')
        setUser(data.data)
        router.push('/')
        reset()
      },
      onError: (error) => {
        toast.error(error.message)
      },
    }
  )

  return (
    <>
      <div className="container relative flex pt-20 flex-col items-center justify-center lg:px-0">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col items-center space-y-2 text-center">
            <div className="text-2xl font-extrabold text-primary">
              🚀 Flash.
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Sign to your account.
            </h1>
            <Link
              className={buttonVariants({
                variant: 'ghost',
                className: 'gap-1.5 text-black',
              })}
              href="/sign-in"
            >
              Don&apos;t have an account? Sign-up
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-6">
            <form
              onSubmit={handleSubmit((data) => {
                const { ...payload } = data
                mutate(payload)
              })}
            >
              <div className="grid gap-2">
                <div className="grid gap-1 py-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    {...register('email')}
                    className={cn({
                      'focus-visible:ring-red-500': errors.email,
                    })}
                    placeholder="you@example.com"
                    disabled={isPending}
                  />
                  {errors?.email && (
                    <p className="text-sm text-red-500">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div className="grid gap-1 py-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    {...register('password')}
                    type="password"
                    className={cn({
                      'focus-visible:ring-red-500': errors.password,
                    })}
                    placeholder="Password"
                    disabled={isPending}
                  />
                  {errors?.password && (
                    <p className="text-sm text-red-500">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <Button isLoading={isPending}>Sign in</Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}

export default Page
