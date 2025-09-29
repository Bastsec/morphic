'use client'

import React from 'react'

type AssistantImageSectionProps = {
  url: string
  alt?: string
  mediaType?: string
  filename?: string
}

function getExtension(mediaType?: string): string {
  switch (mediaType) {
    case 'image/png':
      return 'png'
    case 'image/jpeg':
    case 'image/jpg':
      return 'jpg'
    case 'image/webp':
      return 'webp'
    case 'image/gif':
      return 'gif'
    default:
      return 'png'
  }
}

export function AssistantImageSection({
  url,
  alt,
  mediaType,
  filename
}: AssistantImageSectionProps) {
  if (!url) return null

  const ext = getExtension(mediaType)
  const downloadName = filename && filename.trim().length > 0 ? filename : `image.${ext}`

  return (
    <div className="relative my-2">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt={alt || 'Generated image'}
        className="rounded-md border max-w-full h-auto"
      />
      <a
        href={url}
        download={downloadName}
        aria-label="Download image"
        className="absolute top-2 right-2 text-xs px-2 py-1 rounded border bg-muted/80 hover:bg-muted transition-colors"
      >
        Download
      </a>
    </div>
  )
}
