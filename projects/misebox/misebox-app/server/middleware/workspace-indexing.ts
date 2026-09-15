import { defineEventHandler, getRequestURL, setHeader } from 'h3'

export default defineEventHandler((event) => {
  const url = getRequestURL(event)
  const hostname = url.hostname.toLowerCase()
  if (
    hostname === 'workspace.misebox.app' ||
    hostname === 'workspace.localhost' ||
    url.pathname === '/workspace' ||
    url.pathname.startsWith('/workspace/')
  ) {
    setHeader(event, 'X-Robots-Tag', 'noindex, nofollow')
    setHeader(event, 'Cache-Control', 'no-store')
  }
})
