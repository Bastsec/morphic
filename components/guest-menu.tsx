'use client'

import { useState } from 'react'

import { Link2, Palette, Settings2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { IconGoogle } from '@/components/ui/icons'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

import { ExternalLinkItems } from './external-link-items'
import { ThemeMenuItems } from './theme-menu-items'

interface GuestMenuProps {
  placement?: 'header' | 'sidebar'
}

export default function GuestMenu({ placement = 'header' }: GuestMenuProps) {
  const [isSigningIn, setIsSigningIn] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGoogleSignIn = async () => {
    if (isSigningIn) return
    const supabase = createClient()
    setIsSigningIn(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${location.origin}/auth/oauth`
        }
      })
      if (error) throw error
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An OAuth error occurred')
      setIsSigningIn(false)
    }
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
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sidebar-accent text-sidebar-accent-foreground">
              <Settings2 className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium leading-none truncate">Guest</p>
              <p className="text-xs text-muted-foreground truncate">
                Sign in to customize
              </p>
            </div>
          </button>
        ) : (
          <Button variant="ghost" size="icon" className="h-6 w-6">
            <Settings2 className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-56"
        align={isSidebar ? 'start' : 'end'}
        side={isSidebar ? 'top' : 'bottom'}
        sideOffset={isSidebar ? 8 : 4}
        forceMount
      >
        <DropdownMenuItem
          onSelect={event => {
            event.preventDefault()
            void handleGoogleSignIn()
          }}
          className="cursor-pointer"
        >
          <IconGoogle className="mr-2 h-4 w-4" />
          <span>{isSigningIn ? 'Redirecting...' : 'Continue with Google'}</span>
        </DropdownMenuItem>
        {error ? (
          <DropdownMenuItem
            disabled
            className="whitespace-normal text-xs text-red-500 focus:bg-transparent focus:text-red-500"
          >
            {error}
          </DropdownMenuItem>
        ) : null}
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
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
