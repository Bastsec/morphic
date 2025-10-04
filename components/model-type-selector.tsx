'use client'

import { useEffect, useMemo, useState } from 'react'
import type { ComponentType, SVGProps } from 'react'

import { BadgeCheck, ChevronDown, Image as ImageIcon, Lock, Sparkles, Zap } from 'lucide-react'
import Link from 'next/link'

import { ModelType } from '@/lib/types/model-type'
import { cn } from '@/lib/utils'
import { getCookie, setCookie } from '@/lib/utils/cookies'

import { Button } from './ui/button'
// Badge removed for a cleaner UI
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'

interface ModelOption {
  value: ModelType
  label: string
  tagline: string
  description: string
  premium?: boolean
  icon: ComponentType<SVGProps<SVGSVGElement>>
  accent: string
}

const MODEL_TYPE_OPTIONS: ModelOption[] = [
  {
    value: 'speed',
    label: 'Speed',
    tagline: 'Fast, iterative responses',
    description: 'Ideal for quick drafts, brainstorming, and rapid follow ups.',
    icon: Zap,
    accent: 'bg-sky-500/10 text-sky-500'
  },
  {
    value: 'quality',
    label: 'Quality',
    tagline: 'Best for depth and reasoning',
    description:
      'Requests richer explanations, structured plans, and research-style answers.',
    premium: true,
    icon: Sparkles,
    accent: 'bg-violet-500/10 text-violet-500'
  },
  {
    value: 'image',
    label: 'Image',
    tagline: 'Generate visuals from prompts',
    description:
      'Craft detailed art direction and Bastion will create matching imagery.',
    premium: true,
    icon: ImageIcon,
    accent: 'bg-amber-500/10 text-amber-500'
  }
]

export function ModelTypeSelector() {
  const [value, setValue] = useState<ModelType>('speed')
  const [open, setOpen] = useState(false)
  const [isPremium, setIsPremium] = useState(false)

  useEffect(() => {
    const savedType = getCookie('modelType')
    if (savedType && ['speed', 'quality', 'image'].includes(savedType)) {
      setValue(savedType as ModelType)
    }

    fetch('/api/billing/status')
      .then(res => res.json())
      .then(data => setIsPremium(!!data?.premium))
      .catch(() => setIsPremium(false))
  }, [])

  const selectedOption = useMemo(
    () => MODEL_TYPE_OPTIONS.find(opt => opt.value === value) ?? MODEL_TYPE_OPTIONS[0],
    [value]
  )

  const handleTypeSelect = (type: ModelType) => {
    const option = MODEL_TYPE_OPTIONS.find(item => item.value === type)
    if (!option) return

    if (option.premium && !isPremium) {
      setOpen(false)
      return
    }

    setValue(type)
    setCookie('modelType', type)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="h-9 rounded-full px-3 shadow-none border-input/50 bg-background hover:bg-background"
          aria-label={`Model: ${selectedOption.label}`}
        >
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'flex size-6 items-center justify-center rounded-full bg-muted',
                selectedOption.accent
              )}
            >
              <selectedOption.icon className="size-3.5" />
            </span>
            <span className="text-sm font-medium text-foreground">
              {selectedOption.label}
            </span>
            {selectedOption.premium && !isPremium && (
              <Lock className="size-4 text-muted-foreground" aria-hidden="true" />
            )}
          </div>
          <ChevronDown className="ml-2 size-4 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 space-y-2 p-3">
        <div className="space-y-2" role="menu" aria-label="Select model type">
          {MODEL_TYPE_OPTIONS.map(option => {
            const isSelected = value === option.value
            const gated = option.premium && !isPremium

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handleTypeSelect(option.value)}
                disabled={gated}
                className={cn(
                  'w-full rounded-xl border bg-card text-left p-3 transition-all',
                  'hover:bg-accent/30',
                  isSelected && 'border-primary/60 ring-1 ring-primary/30',
                  gated && 'cursor-not-allowed opacity-60'
                )}
                role="menuitemradio"
                aria-checked={isSelected}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      'flex size-8 items-center justify-center rounded-full bg-muted',
                      option.accent
                    )}
                  >
                    <option.icon className="size-4" />
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">
                        {option.label}
                      </span>
                      {isSelected && (
                        <BadgeCheck className="size-4 text-primary" aria-hidden="true" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{option.tagline}</p>
                  </div>
                  {gated && <Lock className="size-4 text-muted-foreground" aria-hidden="true" />}
                </div>
              </button>
            )
          })}
        </div>
        {!isPremium && (
          <div className="text-xs text-muted-foreground">
            <Link href="/pricing" onClick={() => setOpen(false)} className="hover:underline font-medium text-primary">
              Upgrade to unlock premium modes
            </Link>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
