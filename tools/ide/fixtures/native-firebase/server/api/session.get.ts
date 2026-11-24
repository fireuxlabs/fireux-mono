export default defineEventHandler(async (event) => {
  setHeader(event, 'Cache-Control', 'private, no-store')
  const cookie = getCookie(event, 'fixture_session')
  if (!cookie) return { uid: null }
  const { auth } = admin()
  const session = await auth.verifySessionCookie(cookie, true).catch(() => null)
  return { uid: session?.uid ?? null }
})
