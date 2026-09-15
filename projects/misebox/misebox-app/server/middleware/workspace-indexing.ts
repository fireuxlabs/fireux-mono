import { defineEventHandler, getRequestURL, setHeader } from 'h3'

export default defineEventHandler((event) => {
  const hostname = getRequestURL(event).hostname.toLowerCase()
  if (
    hostname === 'workspace.misebox.app' ||
    hostname === 'workspace.localhost'
  ) {
    setHeader(event, 'X-Robots-Tag', 'noindex, nofollow')
    setHeader(event, 'Cache-Control', 'no-store')
  }
})
