import { defineEventHandler, setHeader } from 'h3'

export default defineEventHandler((event) => {
  const accept = event.node.req.headers.accept || ''
  if (accept.includes('text/html')) {
    setHeader(
      event,
      'Cache-Control',
      'no-store, no-cache, must-revalidate, proxy-revalidate'
    )
  }
})
