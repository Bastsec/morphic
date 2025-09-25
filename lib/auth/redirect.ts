import { NextRequest } from 'next/server'

const absoluteUrlPattern = /^https?:\/\//i

function pickForwardedValue(value: string | null) {
  if (!value) {
    return null
  }

  const [first] = value.split(',')
  return first?.trim() ?? null
}

export function getRequestBaseUrl(request: NextRequest, origin: string) {
  if (process.env.NODE_ENV === 'development') {
    return origin
  }

  const fallbackUrl = new URL(origin)

  const forwardedHostHeader =
    pickForwardedValue(request.headers.get('x-forwarded-host')) ??
    pickForwardedValue(request.headers.get('host'))

  if (!forwardedHostHeader) {
    return origin
  }

  let parsedForwardedHost: URL
  try {
    // Use a dummy protocol so URL parsing works for any host variant
    parsedForwardedHost = new URL(`http://${forwardedHostHeader}`)
  } catch {
    return origin
  }

  const forwardedProto =
    pickForwardedValue(request.headers.get('x-forwarded-proto')) ??
    fallbackUrl.protocol.replace(':', '')

  const forwardedPortHeader = pickForwardedValue(
    request.headers.get('x-forwarded-port')
  )
  const hostPort = parsedForwardedHost.port
  const fallbackPort = fallbackUrl.port
  const forwardedPort =
    forwardedPortHeader ??
    (hostPort ? hostPort : null) ??
    (fallbackPort ? fallbackPort : null)

  const defaultPort = forwardedProto === 'https' ? '443' : '80'
  const portSegment =
    forwardedPort && forwardedPort !== defaultPort
      ? `:${forwardedPort}`
      : ''

  return `${forwardedProto}://${parsedForwardedHost.hostname}${portSegment}`
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
