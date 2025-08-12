import { FC } from 'react'
import Image from 'next/image'
import { AvatarProps } from '@radix-ui/react-avatar'

import { Icons } from './icons'
import { Avatar, AvatarFallback } from './ui/avatar'
import { IUser } from '@/types'
import { useAuthStore } from '@/store'

const UserAvatar: FC<AvatarProps> = ({ ...props }) => {
  const { user } = useAuthStore()
  return (
    <Avatar {...props}>
      {user?.ipAddress ? (
        <div className="relative aspect-square h-full w-full">
          {/* <Image
            fill
            src={user.image}
            alt="profile picture"
            // referrerPolicy="no-referral"
          /> */}
        </div>
      ) : (
        <AvatarFallback>
          <span className="sr-only">{user?.username}</span>
          <Icons.user className="h-4 w-4" />
        </AvatarFallback>
      )}
    </Avatar>
  )
}

export { UserAvatar }
