import Link from 'next/link'
import { Suspense } from 'react'

import type { User } from '@supabase/supabase-js'

import { Crown, Plus } from 'lucide-react'

import { cn } from '@/lib/utils'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger
} from '@/components/ui/sidebar'

import { ChatHistorySection } from './sidebar/chat-history-section'
import { ChatHistorySkeleton } from './sidebar/chat-history-skeleton'
import GuestMenu from './guest-menu'
import { IconLogo } from './ui/icons'
import UserMenu from './user-menu'

interface AppSidebarProps {
  user: User | null
}

export default function AppSidebar({ user }: AppSidebarProps) {
  return (
    <Sidebar side="left" variant="sidebar" collapsible="offcanvas">
      <SidebarHeader className="flex flex-row justify-between items-center">
        <Link href="/" className="flex items-center gap-2 px-2 py-3">
          <IconLogo className={cn('size-5')} />
          <span className="font-semibold text-sm">Bastion</span>
        </Link>
        <SidebarTrigger />
      </SidebarHeader>
      <SidebarContent className="flex flex-col px-2 py-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/" className="flex items-center gap-2">
                <Plus className="size-4" />
                <span>New</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <div className="flex-1 overflow-y-auto">
          <Suspense fallback={<ChatHistorySkeleton />}>
            <ChatHistorySection />
          </Suspense>
        </div>
      </SidebarContent>
      <SidebarFooter className="mt-auto px-2 pb-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/pricing" className="flex items-center gap-2">
                <Crown className="size-4" />
                <span>Pricing</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        {user ? (
          <UserMenu user={user} placement="sidebar" />
        ) : (
          <GuestMenu placement="sidebar" />
        )}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
