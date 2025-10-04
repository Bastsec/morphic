import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { UserTextSection } from '@/components/user-text-section'

describe('UserTextSection', () => {
  it('renders user content as markdown', () => {
    const { container } = render(
      <UserTextSection content={'**Bold** message with `code`'} />
    )

    expect(screen.getByText(/message with/i)).toBeInTheDocument()
    const strong = container.querySelector('strong')
    expect(strong).not.toBeNull()
    expect(strong?.textContent).toBe('Bold')
    const code = container.querySelector('code')
    expect(code?.textContent).toBe('code')
  })

  it('normalises newlines before propagating updates', async () => {
    const user = userEvent.setup()
    const handleUpdate = vi.fn().mockResolvedValue(undefined)

    render(
      <UserTextSection
        content={'Original'}
        messageId="msg-1"
        onUpdateMessage={handleUpdate}
      />
    )

    await user.click(screen.getByRole('button', { name: /edit message/i }))

    const textarea = await screen.findByRole('textbox')
    fireEvent.change(textarea, {
      target: { value: 'First line\r\nSecond line' }
    })

    await user.click(screen.getByRole('button', { name: /save/i }))

    expect(handleUpdate).toHaveBeenCalledWith('msg-1', 'First line\nSecond line')
  })
})
