'use client'

import { Button } from './ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import Link from 'next/link'
import { useAuthStore } from '@/store'

const UserAccountNav = () => {
  const { user, logout } = useAuthStore()

  const onClick = () => {
    logout()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className="overflow-visible">
        <Button variant="ghost" size="sm" className="relative">
          My account
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="bg-white w-60" align="end">
        <div className="flex items-center justify-start pl-2">
          <div className="flex flex-col space-y-0.5 leading-none w-[90%]">
            <p className="font-medium text-base text-black truncate">
              {user?.email}
            </p>
          </div>
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          {user?.role === 'ADMIN' ? (
            <Link href={`/admin/product`}>Dashboard</Link>
          ) : (
            <Link href={`/orders`}>Orders</Link>
          )}
        </DropdownMenuItem>

        <DropdownMenuItem onClick={onClick} className="cursor-pointer">
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export { UserAccountNav }
