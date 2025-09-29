'use client'

import { usePathname, useRouter } from 'next/navigation'

import { Plus } from 'lucide-react'

export default function NewChatButton() {
  const router = useRouter()
  const pathname = usePathname()

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    if (pathname === '/') {
      // Already on home: refresh to get a new chat id
      router.refresh()
    } else {
      // Navigate to home to start a new chat
      router.push('/')
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="flex items-center gap-2 w-full"
    >
      <Plus className="size-4" />
      <span>New</span>
    </button>
  )
}
