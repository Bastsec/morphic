'use client'

import { useEffect, useState } from 'react'
import { HyperText } from '@/components/ui/hyper-text'
import { getCookie } from '@/lib/utils/cookies'

const MODEL_IDS: Record<string, string> = {
  speed: 'gpt-5-mini',
  quality: 'gpt-5-high',
  image: 'gpt-image-1'
}

export default function ModelHypertextBanner() {
  const [modelType, setModelType] = useState<string>(() => getCookie('modelType') || 'speed')

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as string | undefined
      if (detail && ['speed', 'quality', 'image'].includes(detail)) {
        setModelType(detail)
      } else {
        // Fallback to cookie if detail missing
        const fromCookie = getCookie('modelType')
        if (fromCookie) setModelType(fromCookie)
      }
    }
    window.addEventListener('model-type-changed', handler as EventListener)
    return () => window.removeEventListener('model-type-changed', handler as EventListener)
  }, [])

  const label =
    modelType === 'speed'
      ? `Speed • ${MODEL_IDS.speed}`
      : modelType === 'quality'
        ? `Quality • ${MODEL_IDS.quality}`
        : `Image • ${MODEL_IDS.image}`

  return (
    <div className="flex items-center justify-center">
      <HyperText
        startOnView
        animateOnHover={false}
        duration={900}
        className="py-0 text-sm font-medium tracking-wide text-muted-foreground"
      >
        {label}
      </HyperText>
    </div>
  )
}

