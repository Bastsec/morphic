'use client'

import { cn } from '@/lib/utils'

function IconLogo({ className, ...props }: React.ComponentProps<'svg'>) {
  return (
    <svg
      fill="currentColor"
      viewBox="0 0 256 256"
      role="img"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('h-4 w-4', className)}
      {...props}
    >
      <circle cx="128" cy="128" r="128" fill="black"></circle>
      <circle cx="102" cy="128" r="18" fill="white"></circle>
      <circle cx="154" cy="128" r="18" fill="white"></circle>
    </svg>
  )
}

function IconLogoOutline({ className, ...props }: React.ComponentProps<'svg'>) {
  return (
    <svg
      fill="currentColor"
      viewBox="0 0 256 256"
      role="img"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('h-4 w-4', className)}
      {...props}
    >
      <circle
        cx="128"
        cy="128"
        r="108"
        fill="none"
        stroke="currentColor"
        strokeWidth="24"
      ></circle>
      <circle cx="102" cy="128" r="18" fill="currentColor"></circle>
      <circle cx="154" cy="128" r="18" fill="currentColor"></circle>
    </svg>
  )
}

function IconGoogle({ className, ...props }: React.ComponentProps<'svg'>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 262"
      role="img"
      className={cn('h-4 w-4', className)}
      {...props}
    >
      <path
        fill="#4285F4"
        d="M255.49 133.51c0-10.18-.82-17.61-2.61-25.32H130.49v45.93h71.95c-1.45 11.56-9.27 28.96-26.68 40.63l-.24 1.59 38.73 30 2.68.27c24.57-22.66 38.56-56 38.56-93.1"
      />
      <path
        fill="#34A853"
        d="M130.49 261.1c35.07 0 64.57-11.67 86.09-31.79l-41.02-31.81c-10.96 7.53-25.7 12.77-45.07 12.77-34.47 0-63.71-22.66-74.14-53.98l-1.53.13-40.16 31.12-.53 1.46C35.07 233 79.21 261.1 130.49 261.1"
      />
      <path
        fill="#FBBC05"
        d="M56.35 156.29c-2.73-8.09-4.3-16.77-4.3-25.79s1.57-17.7 4.15-25.79l-.07-1.73-40.55-31.55-1.33.62C5.17 87.64.49 109.25.49 130.5s4.68 42.86 13.76 58.46"
      />
      <path
        fill="#EA4335"
        d="M130.49 50.39c24.41 0 40.83 10.56 50.21 19.39l36.68-35.81C194.92 12.46 165.56 0 130.49 0 79.21 0 35.07 28.11 12.72 72.04l41.17 31.67C64.92 72.72 96.02 50.39 130.49 50.39"
      />
    </svg>
  )
}

function IconChatBubble({
  className,
  ...props
}: React.ComponentProps<'svg'>) {
  return (
    <svg
      viewBox="0 0 24 24"
      role="img"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('h-4 w-4', className)}
      {...props}
    >
      <path
        d="M5 4h14a1 1 0 0 1 1 1v9.5a1 1 0 0 1-1 1H10l-4.6 3.4A.6.6 0 0 1 5 18.5V5a1 1 0 0 1 1-1Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="9" cy="9.5" r="1" fill="currentColor" />
      <circle cx="12" cy="9.5" r="1" fill="currentColor" />
      <circle cx="15" cy="9.5" r="1" fill="currentColor" />
    </svg>
  )
}

export { IconChatBubble, IconGoogle, IconLogo, IconLogoOutline }
