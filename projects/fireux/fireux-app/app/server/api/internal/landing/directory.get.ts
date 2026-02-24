import { defineEventHandler, setResponseHeaders, type H3Event } from 'h3'

type SourceEcosystem = {
  key: 'fireux' | 'misebox' | 'cleanbox'
  name: string
  baseUrl: string
}

type RemoteAppsResponse = {
  apps?: Array<Record<string, unknown>>
}

type DirectoryApp = {
  id: string
  name: string
  ecosystem: string
  role: string
  src: string
  text: string
  href: string
}

type DirectoryEcosystem = {
  key: string
  name: string
  src: string
  text: string
  href: string
}

type DirectoryError = {
  ecosystem: string
  url: string
  status?: number
  message: string
}

const ECOSYSTEM_SOURCES: SourceEcosystem[] = [
  { key: 'fireux', name: 'FireUX', baseUrl: 'https://fireux.app' },
  { key: 'misebox', name: 'Misebox', baseUrl: 'https://misebox.app' },
  { key: 'cleanbox', name: 'Cleanbox', baseUrl: 'https://cleanbox.app' },
]

function initials(name: string) {
  return name
    .split(/\s+/g)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

function asString(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function asMedia(value: unknown) {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null
}

function toDirectoryApp(
  raw: Record<string, unknown>,
  ecosystemBaseUrl: string
): DirectoryApp | null {
  const id = asString(raw.id)
  const name = asString(raw.app_name)
  const ecosystem = asString(raw.ecosystem)
  const role = asString(raw.role)
  const media = asMedia(raw.media)
  const logoUrl = asString(media?.logo_url)

  if (!id || !name || !ecosystem || !role) return null

  return {
    id,
    name,
    ecosystem,
    role,
    src: logoUrl,
    text: initials(name),
    href: role === 'global' ? ecosystemBaseUrl : '',
  }
}

export default defineEventHandler(async (event: H3Event) => {
  setResponseHeaders(event, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  })

  const errors: DirectoryError[] = []
  const appsByEcosystem = await Promise.all(
    ECOSYSTEM_SOURCES.map(async (source) => {
      const url = `${source.baseUrl}/api/public/apps`

      try {
        const res = await fetch(url, {
          method: 'GET',
          headers: { Accept: 'application/json' },
        })

        if (!res.ok) {
          errors.push({
            ecosystem: source.key,
            url,
            status: res.status,
            message: `HTTP ${res.status}`,
          })
          return { source, apps: [] as DirectoryApp[] }
        }

        const json = (await res.json()) as RemoteAppsResponse
        const rows = Array.isArray(json.apps) ? json.apps : []
        const apps = rows
          .map((row) =>
            toDirectoryApp(
              (row && typeof row === 'object' ? row : {}) as Record<string, unknown>,
              source.baseUrl
            )
          )
          .filter((row): row is DirectoryApp => Boolean(row))
          .sort((a, b) => a.id.localeCompare(b.id))

        return { source, apps }
      } catch (error) {
        errors.push({
          ecosystem: source.key,
          url,
          message: error instanceof Error ? error.message : 'Request failed',
        })
        return { source, apps: [] as DirectoryApp[] }
      }
    })
  )

  const apps = appsByEcosystem.flatMap((entry) => entry.apps)

  const ecosystems: DirectoryEcosystem[] = appsByEcosystem.map(({ source, apps }) => {
    const globalApp = apps.find((app) => app.role === 'global')
    return {
      key: source.key,
      name: source.name,
      src: globalApp?.src || '',
      text: initials(source.name),
      href: source.baseUrl,
    }
  })

  return {
    ecosystems,
    apps,
    errors,
  }
})
