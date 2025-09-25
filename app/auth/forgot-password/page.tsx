import Link from 'next/link'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { IconLogo } from '@/components/ui/icons'

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl flex flex-col items-center justify-center gap-4">
              <IconLogo className="size-12" />
              Password resets unavailable
            </CardTitle>
            <CardDescription>
              Bastion now uses Google accounts for sign in. Resetting passwords
              is no longer required.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-sm text-muted-foreground">
              Use the button below to continue with your Google account.
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link href="/auth/login">Continue with Google</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
