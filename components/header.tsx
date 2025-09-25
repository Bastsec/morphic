'use client'

// import Link from 'next/link' // No longer needed directly here for Sign In button
import React, { useState } from 'react'
import { usePathname } from 'next/navigation'

import { cn } from '@/lib/utils'

import { useSidebar } from '@/components/ui/sidebar'

import { Button } from './ui/button'
import { FeedbackModal } from './feedback-modal'
// import { Button } from './ui/button' // No longer needed directly here for Sign In button
export const Header: React.FC = () => {
  const { open } = useSidebar()
  const pathname = usePathname()
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const isRootPage = pathname === '/'

  return (
    <>
      <header
        className={cn(
          'absolute top-0 right-0 p-3 flex justify-between items-center z-10 backdrop-blur-sm lg:backdrop-blur-none bg-background/80 lg:bg-transparent transition-[width] duration-200 ease-linear',
          open ? 'md:w-[calc(100%-var(--sidebar-width))]' : 'md:w-full',
          'w-full'
        )}
      >
        {/* This div can be used for a logo or title on the left if needed */}
        <div></div>

        {isRootPage && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFeedbackOpen(true)}
            >
              Feedback
            </Button>
          </div>
        )}
      </header>

      {isRootPage && (
        <FeedbackModal open={feedbackOpen} onOpenChange={setFeedbackOpen} />
      )}
    </>
  )
}

export default Header
