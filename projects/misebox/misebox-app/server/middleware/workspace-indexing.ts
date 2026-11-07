import { defineEventHandler, getRequestURL, setHeader } from 'h3'

export default defineEventHandler((event) => {
  const url = getRequestURL(event, {
    xForwardedHost: true,
    xForwardedProto: true,
  })
  if (
    url.pathname === '/' ||
    url.pathname === '/workspace' ||
    url.pathname.startsWith('/workspace/')
  ) {
    setHeader(event, 'X-Robots-Tag', 'noindex, nofollow')
    setHeader(event, 'Cache-Control', 'no-store')
  }
})
