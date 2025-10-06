export const dynamic = 'force-dynamic'

import { generateId } from '@/lib/db/schema'

import { ChangelogBanner } from '@/components/changelog-banner'
import { Chat } from '@/components/chat'
import ModelHypertextBanner from '@/components/model-hypertext-banner'

export default async function Page() {
  const id = generateId()
  return (
    <>
      <div className="w-full flex items-center justify-center pt-8 pb-4">
        <ModelHypertextBanner />
      </div>
      <Chat key={id} id={id} />
      <ChangelogBanner />
    </>
  )
}
