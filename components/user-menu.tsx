'use client'

import { useRouter } from 'next/navigation'

import { User } from '@supabase/supabase-js'
import { Link2, LogOut, Palette } from 'lucide-react'

import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

import { Button } from './ui/button'
import { ExternalLinkItems } from './external-link-items'
import { ThemeMenuItems } from './theme-menu-items'

interface UserMenuProps {
  user: User
  placement?: 'header' | 'sidebar'
}

export default function UserMenu({ user, placement = 'header' }: UserMenuProps) {
  const router = useRouter()
  const userName =
    user.user_metadata?.full_name || user.user_metadata?.name || 'User'
  const avatarUrl =
    user.user_metadata?.avatar_url || user.user_metadata?.picture

  const getInitials = (name: string, email: string | undefined) => {
    if (name && name !== 'User') {
      const names = name.split(' ')
      if (names.length > 1) {
        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
      }
      return name.substring(0, 2).toUpperCase()
    }
    if (email) {
      return email.split('@')[0].substring(0, 2).toUpperCase()
    }
    return 'U'
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const isSidebar = placement === 'sidebar'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {isSidebar ? (
          <button
            type="button"
            className={cn(
              'flex w-full items-center gap-3 rounded-md px-2 py-2 text-left text-sm transition-colors',
              'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring'
            )}
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src={avatarUrl} alt={userName} />
              <AvatarFallback>{getInitials(userName, user.email)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium leading-none truncate">
                {userName}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user.email}
              </p>
            </div>
          </button>
        ) : (
          <Button variant="ghost" className="relative h-6 w-6 rounded-full">
            <Avatar className="h-6 w-6">
              <AvatarImage src={avatarUrl} alt={userName} />
              <AvatarFallback>{getInitials(userName, user.email)}</AvatarFallback>
            </Avatar>
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-60"
        align={isSidebar ? 'start' : 'end'}
        side={isSidebar ? 'top' : 'bottom'}
        sideOffset={isSidebar ? 8 : 4}
        forceMount
      >
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none truncate">
              {userName}
            </p>
            <p className="text-xs leading-none text-muted-foreground truncate">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Palette className="mr-2 h-4 w-4" />
            <span>Theme</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <ThemeMenuItems />
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Link2 className="mr-2 h-4 w-4" />
            <span>Links</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <ExternalLinkItems />
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
