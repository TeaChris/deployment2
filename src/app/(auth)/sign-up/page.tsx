'use client'

import { useApiMutation } from '@/config'
import { signupSchema, TSignUpSchema, cn } from '@/utils'
import { Button, buttonVariants, Checkbox, Input, Label } from '@/components'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { toast } from 'sonner'
import { useForm, Controller } from 'react-hook-form'
import { ArrowRight } from 'lucide-react'
import { zodResolver } from '@hookform/resolvers/zod'
import { IUser } from '@/types'

type TSignUpPayload = Omit<TSignUpSchema, 'confirmPassword'>

export default function Page() {
  const router = useRouter()

  const {
    reset,
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TSignUpSchema>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      isTermAndConditionAccepted: false,
    },
  })

  const { mutate, isPending } = useApiMutation<IUser, TSignUpPayload>(
    ['signUp'],
    '/auth/signup',
    'POST',
    undefined,
    {
      onSuccess: () => {
        toast.success('Account created successfully')
        router.push('/verify-email')
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
              Signup to flash.
            </h1>
            <Link
              className={buttonVariants({
                variant: 'ghost',
                className: 'gap-1.5 text-black',
              })}
              href="/sign-in"
            >
              Already have an account? Sign-in
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
                  <Label htmlFor="username">Username</Label>
                  <Input
                    {...register('username')}
                    className={cn({
                      'focus-visible:ring-red-500': errors.username,
                    })}
                    placeholder="User"
                    disabled={isPending}
                  />
                  {errors?.username && (
                    <p className="text-sm text-red-500">
                      {errors.username.message}
                    </p>
                  )}
                </div>

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

                <div className="grid gap-1 py-2">
                  <Label htmlFor="password">Confirm Password</Label>
                  <Input
                    {...register('confirmPassword')}
                    type="password"
                    className={cn({
                      'focus-visible:ring-red-500': errors.confirmPassword,
                    })}
                    placeholder="Password"
                    disabled={isPending}
                  />
                  {errors?.confirmPassword && (
                    <p className="text-sm text-red-500">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <div className="grid gap-1 py-2">
                  <div className="w-full flex gap-x-2">
                    <Controller
                      name="isTermAndConditionAccepted"
                      control={control}
                      render={({ field }) => (
                        <Checkbox
                          id="terms"
                          checked={field.value}
                          disabled={isPending}
                          onCheckedChange={field.onChange}
                        />
                      )}
                    />
                    <Label htmlFor="terms">Accept terms and conditions</Label>
                  </div>

                  {errors?.isTermAndConditionAccepted && (
                    <p className="text-sm text-red-500">
                      {errors.isTermAndConditionAccepted.message}
                    </p>
                  )}
                </div>
                <Button isLoading={isPending}>sign up</Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}
