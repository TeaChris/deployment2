'use client'

import Link from 'next/link'

import { buttonVariants } from './ui'
import { useAuthStore } from '@/store'
import { UserAccountNav } from './user.account.nav'
import { MaxWidthWrapper } from './max.width.wrapper'

const NAV_LINKS = [
  {
    label: 'Collections',
    href: '/',
  },
  {
    label: 'Your orders',
    href: '/orders',
  },
]

const Navbar = () => {
  const { user } = useAuthStore()

  return (
    <div className="bg-white sticky z-50 top-0 inset-x-0 h-16">
      <header className="relative bg-white">
        <MaxWidthWrapper>
          <div className="border-b border-gray-200">
            <div className="flex h-16 items-center">
              {/* add mobile nav */}
              {/* <MobileNav /> */}

              <div className="ml-4 flex lg:ml-0">
                <Link href="/" className="text-2xl font-extrabold text-primary">
                  🚀 Flash.
                </Link>
              </div>

              <div className="hidden z-50 lg:ml-8 lg:block lg:self-stretch">
                <div className="flex gap-4 h-full items-center">
                  {NAV_LINKS.map((n) => (
                    <Link
                      key={n.href}
                      href={n.href}
                      className={buttonVariants({
                        variant: 'ghost',
                      })}
                    >
                      {n.label}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="ml-auto flex items-center">
                <div className="hidden lg:flex lg:flex-1 lg:items-center lg:justify-end lg:space-x-6">
                  {user ? null : (
                    <Link
                      href="/sign-in"
                      className={buttonVariants({
                        variant: 'ghost',
                      })}
                    >
                      Sign in
                    </Link>
                  )}

                  {user ? null : (
                    <span className="h-6 w-px bg-gray-200" aria-hidden="true" />
                  )}

                  {user ? (
                    <UserAccountNav />
                  ) : (
                    <Link
                      href="sign-up"
                      className={buttonVariants({
                        variant: 'ghost',
                      })}
                    >
                      Create account
                    </Link>
                  )}

                  {user ? (
                    <span className="h-6 w-px bg-gray-200" aria-hidden="true" />
                  ) : null}

                  {user ? null : (
                    <div className="flex lg:ml-6">
                      <span
                        className="h-6 w-px bg-gray-200"
                        aria-hidden="true"
                      />
                    </div>
                  )}

                  <div className="ml-4 flow-root lg:ml-6">{/* <Cart /> */}</div>
                </div>

                <div className="lg:hidden flex flex-1 justify-end">
                  {/* <Cart /> */}
                </div>
              </div>
            </div>
          </div>
        </MaxWidthWrapper>
      </header>
    </div>
  )
}

export { Navbar }
