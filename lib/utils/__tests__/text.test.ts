import { describe, expect, it } from 'vitest'

import { normalizeUserText } from '@/lib/utils/text'

describe('normalizeUserText', () => {
  it('converts Windows style newlines into Unix newlines', () => {
    const result = normalizeUserText('first line\r\nsecond line\r\nthird line')
    expect(result).toBe('first line\nsecond line\nthird line')
  })

  it('drops stray carriage returns', () => {
    const result = normalizeUserText('first line\rsecond line')
    expect(result).toBe('first line\nsecond line')
  })

  it('returns an empty string for nullish values', () => {
    expect(normalizeUserText('')).toBe('')
    expect(normalizeUserText(null)).toBe('')
    expect(normalizeUserText(undefined)).toBe('')
  })
})

