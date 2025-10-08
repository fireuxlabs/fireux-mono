import { defineEventHandler, getQuery, setResponseStatus } from 'h3'

/**
 * Dev-only logo resolver.
 * Returns a random placeholder image so the UI shows a real thumbnail.
 */
export default defineEventHandler((event) => {
  const q = getQuery(event)
  const name = typeof q.q === 'string' ? q.q.trim() : ''
  if (!name) {
    setResponseStatus(event, 400)
    return { url: null }
  }

  const randomSeed = Math.floor(Math.random() * 10_000)
  const url = `https://picsum.photos/seed/${randomSeed}/96/96`

  return { url }
})
