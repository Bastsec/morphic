export const dynamic = 'force-dynamic'

import { generateId } from '@/lib/db/schema'

import { ChangelogBanner } from '@/components/changelog-banner'
import { Chat } from '@/components/chat'
import PremiumBanner from '@/components/premium-banner'

export default async function Page() {
  const id = generateId()
  return (
    <>
      <Chat key={id} id={id} />
      <ChangelogBanner />
      <PremiumBanner />
    </>
  )
}
