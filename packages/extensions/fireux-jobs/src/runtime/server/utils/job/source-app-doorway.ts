const httpsOrigin = (value: unknown) => {
  const raw = String(value ?? '').trim()
  if (!raw || raw.length > 2_000) return ''

  try {
    const url = new URL(raw)
    if (url.protocol !== 'https:' || url.username || url.password) return ''
    url.hash = ''
    url.search = ''
    url.pathname = url.pathname.replace(/\/+$/, '')
    return url.toString().replace(/\/$/, '')
  } catch {
    return ''
  }
}

export function projectSourceAppDoorway(
  jobId: string,
  rawApp: Record<string, unknown>
) {
  if (rawApp.status !== 'active') return null

  const socialLinks =
    rawApp.social_links &&
    typeof rawApp.social_links === 'object' &&
    !Array.isArray(rawApp.social_links)
      ? (rawApp.social_links as Record<string, unknown>)
      : {}
  const origin = httpsOrigin(socialLinks.website)
  const name = String(rawApp.app_short_name || rawApp.app_name || '').trim()
  if (!origin || !name) return null

  return {
    label: `Apply with ${name}`,
    url: `${origin}/jobs/${encodeURIComponent(jobId)}`,
  }
}
