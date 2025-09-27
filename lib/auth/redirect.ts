import { NextRequest } from 'next/server'

const absoluteUrlPattern = /^https?:\/\//i

function pickForwardedValue(value: string | null) {
  if (!value) return null
  const [first] = value.split(',')
  return first?.trim() ?? null
}

function coerceHttpsByPlatform(request: NextRequest, fallbackProto: string) {
  // Azure frontends often set x-arr-ssl=true for HTTPS
  const arrSsl = pickForwardedValue(request.headers.get('x-arr-ssl'))
  if (arrSsl === 'true') return 'https'
  return fallbackProto
}

export function getRequestBaseUrl(request: NextRequest, origin: string) {
  // Explicit override for tricky proxy setups
  const siteUrlOverride =
    process.env.NEXT_PUBLIC_SITE_URL ?? process.env.SITE_URL ?? null
  if (siteUrlOverride && absoluteUrlPattern.test(siteUrlOverride)) {
    return siteUrlOverride.replace(/\/$/, '')
  }

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

  const rawForwardedProto =
    pickForwardedValue(request.headers.get('x-forwarded-proto')) ??
    fallbackUrl.protocol.replace(':', '')
  const forwardedProto = coerceHttpsByPlatform(request, rawForwardedProto)

  // Azure (and some proxies) send x-forwarded-port with the container port (e.g. 3000),
  // which is NOT the public port. Only honor a port if it was explicitly present in the
  // forwarded host header (e.g. example.com:8443). Otherwise, omit the port.
  const hostPortFromHeader = parsedForwardedHost.port
  const defaultPort = forwardedProto === 'https' ? '443' : '80'
  const portSegment =
    hostPortFromHeader && hostPortFromHeader !== defaultPort
      ? `:${hostPortFromHeader}`
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
