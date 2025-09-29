'use client'

import React from 'react'

type AssistantImageSectionProps = {
  url: string
  alt?: string
}

export function AssistantImageSection({ url, alt }: AssistantImageSectionProps) {
  if (!url) return null

  return (
    <div className="my-2">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt={alt || 'Generated image'}
        className="rounded-md border max-w-full h-auto"
      />
    </div>
  )
}

