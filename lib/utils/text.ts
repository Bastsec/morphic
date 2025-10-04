/**
 * Normalises user supplied text so chat input handles pasted and typed content consistently.
 *
 * - Converts Windows style line-endings (\r\n) and stray carriage returns to \n
 * - Returns an empty string when the provided value is falsy
 */
export function normalizeUserText(value: string | null | undefined): string {
  if (!value) return ''
  return value.replace(/\r\n?/g, '\n')
}

