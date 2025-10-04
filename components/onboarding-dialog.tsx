'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ComponentType, SVGProps } from 'react'

import {
  ArrowRight,
  Compass,
  Crown,
  FileUp,
  Layers,
  ShieldCheck,
  Sparkles,
  Workflow
} from 'lucide-react'
import { toast } from 'sonner'

import { createClient } from '@/lib/supabase/client'
import { isSupabaseBrowserConfigured } from '@/lib/supabase/config'
import { cn } from '@/lib/utils'

import { Badge } from './ui/badge'
import { Button } from './ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from './ui/dialog'

const ONBOARDING_STORAGE_KEY = 'morphic:onboarding-complete'

interface OnboardingDialogProps {
  initialHasOnboarded?: boolean
}

interface OnboardingFeature {
  title: string
  description: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
  accent: string
}

interface OnboardingStep {
  id: string
  title: string
  description: string
  badge?: string
  features: OnboardingFeature[]
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Bastion',
    description:
      'Your co-pilot for researching, planning, and delivering work without leaving the canvas.',
    features: [
      {
        title: 'Ask and explore',
        description: 'Blend chat, search, and tools in one adaptive thread.',
        icon: Compass,
        accent: 'bg-sky-500/10 text-sky-500'
      },
      {
        title: 'Work with context',
        description: 'Drop in files or links and Bastion keeps everything organized.',
        icon: FileUp,
        accent: 'bg-emerald-500/10 text-emerald-500'
      },
      {
        title: 'Capture outcomes',
        description: 'Summaries, briefs, and artifacts stay attached to the conversation.',
        icon: Layers,
        accent: 'bg-blue-500/10 text-blue-500'
      }
    ]
  },
  {
    id: 'core-features',
    title: 'Core features on every plan',
    description:
      'Get reliable answers, references, and collaborative tools the moment you sign in.',
    features: [
      {
        title: 'Cited answers',
        description: 'Trace responses back to sources the assistant found for you.',
        icon: ShieldCheck,
        accent: 'bg-indigo-500/10 text-indigo-500'
      },
      {
        title: 'Reusable prompts',
        description: 'Save your favourite workflows and share them across the team.',
        icon: Workflow,
        accent: 'bg-amber-500/10 text-amber-500'
      },
      {
        title: 'Seamless hand-off',
        description: 'Export summaries or continue inside tools without copy-paste.',
        icon: Sparkles,
        accent: 'bg-fuchsia-500/10 text-fuchsia-500'
      }
    ]
  },
  {
    id: 'premium',
    title: 'Unlock premium superpowers',
    badge: 'Premium',
    description:
      'Upgrade when you need more horsepower, richer models, and creative capabilities.',
    features: [
      {
        title: 'Advanced models',
        description: 'Access higher quality reasoning and image generation modes.',
        icon: Crown,
        accent: 'bg-amber-500/15 text-amber-600'
      },
      {
        title: 'Priority throughput',
        description: 'Faster queues for large jobs and research-heavy sessions.',
        icon: Sparkles,
        accent: 'bg-violet-500/15 text-violet-500'
      },
      {
        title: 'Team insights',
        description: 'Usage analytics and admin controls keep work secure at scale.',
        icon: ShieldCheck,
        accent: 'bg-emerald-500/15 text-emerald-600'
      }
    ]
  }
]

export function OnboardingDialog({
  initialHasOnboarded
}: OnboardingDialogProps) {
  const [hasCompleted, setHasCompleted] = useState<boolean>(
    Boolean(initialHasOnboarded)
  )
  const [open, setOpen] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)
  const [isPersisting, setIsPersisting] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    if (initialHasOnboarded) {
      setHasCompleted(true)
      setOpen(false)
      return
    }

    const stored = window.localStorage.getItem(ONBOARDING_STORAGE_KEY)
    if (stored === 'true') {
      setHasCompleted(true)
      setOpen(false)
      return
    }

    setHasCompleted(false)
    setOpen(true)
  }, [initialHasOnboarded])

  useEffect(() => {
    if (open) {
      setStepIndex(0)
    }
  }, [open])

  const finishOnboarding = useCallback(async () => {
    if (isPersisting || hasCompleted) {
      setOpen(false)
      return
    }

    setIsPersisting(true)
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true')
      }
      setHasCompleted(true)
      setOpen(false)

      if (isSupabaseBrowserConfigured()) {
        const supabase = createClient()
        const { error } = await supabase.auth.updateUser({
          data: { has_onboarded: true }
        })

        if (error) {
          throw error
        }
      }
    } catch (error) {
      console.error('Failed to persist onboarding status', error)
      toast.error(
        'We saved this locally but could not update your account. You may see onboarding again later.'
      )
    } finally {
      setIsPersisting(false)
    }
  }, [hasCompleted, isPersisting])

  const handleSkip = useCallback(() => {
    void finishOnboarding()
  }, [finishOnboarding])

  const handleNext = useCallback(() => {
    if (stepIndex >= ONBOARDING_STEPS.length - 1) {
      void finishOnboarding()
      return
    }
    setStepIndex(index => Math.min(index + 1, ONBOARDING_STEPS.length - 1))
  }, [finishOnboarding, stepIndex])

  const handleBack = useCallback(() => {
    setStepIndex(index => Math.max(index - 1, 0))
  }, [])

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) {
        void finishOnboarding()
      } else {
        setOpen(true)
      }
    },
    [finishOnboarding]
  )

  const activeStep = useMemo(() => ONBOARDING_STEPS[stepIndex], [stepIndex])
  const progress = ((stepIndex + 1) / ONBOARDING_STEPS.length) * 100

  if (hasCompleted) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader className="space-y-3">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-xl font-semibold">
              {activeStep.title}
              {activeStep.badge && (
                <Badge variant="outline" className="text-xs">
                  {activeStep.badge}
                </Badge>
              )}
            </DialogTitle>
            <span className="text-xs font-medium text-muted-foreground">
              Step {stepIndex + 1} of {ONBOARDING_STEPS.length}
            </span>
          </div>
          <DialogDescription className="text-sm text-muted-foreground">
            {activeStep.description}
          </DialogDescription>
          <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
            <span
              className="block h-full rounded-full bg-primary transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </DialogHeader>

        <div className="space-y-3 py-2">
          {activeStep.features.map(feature => {
            const Icon = feature.icon
            return (
              <div
                key={`${activeStep.id}-${feature.title}`}
                className="flex items-start gap-3 rounded-2xl border border-border/60 bg-muted/40 p-4"
              >
                <span
                  className={cn(
                    'mt-0.5 flex size-10 items-center justify-center rounded-full border border-border/40',
                    feature.accent
                  )}
                >
                  <Icon className="size-5" />
                </span>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground">
                    {feature.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-1">
            {ONBOARDING_STEPS.map((step, index) => (
              <span
                key={step.id}
                className={cn(
                  'h-2.5 w-2.5 rounded-full bg-muted transition-colors',
                  index === stepIndex && 'bg-primary'
                )}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              disabled={isPersisting}
              className="text-xs"
            >
              Skip for now
            </Button>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBack}
                disabled={stepIndex === 0 || isPersisting}
              >
                Back
              </Button>
              <Button
                size="sm"
                onClick={handleNext}
                disabled={isPersisting}
              >
                {stepIndex === ONBOARDING_STEPS.length - 1 ? (
                  <span className="flex items-center gap-1">
                    Start chatting
                    <ArrowRight className="size-4" />
                  </span>
                ) : (
                  'Next'
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

