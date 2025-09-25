import { NextRequest } from 'next/server'

const absoluteUrlPattern = /^https?:\/\//i

export function getRequestBaseUrl(request: NextRequest, origin: string) {
  if (process.env.NODE_ENV === 'development') {
    return origin
  }

  const forwardedHost = request.headers.get('x-forwarded-host')
  return forwardedHost ? `https://${forwardedHost}` : origin
}

export function buildRedirectUrl(
  request: NextRequest,
  origin: string,
  path: string
) {
  if (absoluteUrlPattern.test(path)) {
    return path
  }

  const baseUrl = getRequestBaseUrl(request, origin)
  if (path.startsWith('/')) {
    return `${baseUrl}${path}`
  }

  return `${baseUrl}/${path}`
}
