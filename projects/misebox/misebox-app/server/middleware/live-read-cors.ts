import {
  createError,
  defineEventHandler,
  getHeader,
  getRequestURL,
  handleCors,
} from 'h3'

// Hosting buffers streaming responses. The browser connects to this same
// App's function directly; each projection still enforces its own authority.
const origins = [
  'https://misebox.app',
  'https://www.misebox.app',
  'https://workspace.misebox.app',
  'https://jobs.misebox.app',
  'https://suppliers.misebox.app',
  'https://misebox-78f9c.web.app',
  'https://misebox-78f9c.firebaseapp.com',
]

export default defineEventHandler((event) => {
  const url = getRequestURL(event)
  if (url.pathname !== '/api/fireux/live') return
  const origin = getHeader(event, 'origin')
  if (!origin || origin === url.origin) return
  if (!origins.includes(origin)) {
    throw createError({ statusCode: 403, message: 'Live read origin is not allowed.' })
  }
  if (handleCors(event, {
    origin: origins,
    methods: ['POST', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Accept'],
    credentials: false,
    maxAge: '600',
  })) return ''
})
