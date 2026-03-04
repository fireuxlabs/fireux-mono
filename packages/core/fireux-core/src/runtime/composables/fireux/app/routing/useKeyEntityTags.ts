import { computed } from 'vue'
import { useRouter } from 'vue-router'

const toLabel = (value: string) =>
  value
    .split(/[-_]+/)
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(' ')

type KeyEntityTagItem = {
  key: string
  label: string
  to: string
}

const normalizeTagKey = (value: unknown) =>
  String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')

const isStaticPath = (value: string) =>
  value.startsWith('/') && !value.includes('/:') && !value.includes('/[')

const isPreferredPath = (tag: string, value: string) => value === `/${tag}`

export function useKeyEntityTags() {
  const router = useRouter()

  const keyEntityTags = computed(() => {
    const byKey = new Map<string, KeyEntityTagItem>()

    for (const route of router.getRoutes()) {
      const meta = route.meta as Record<string, unknown>
      const raw = meta?.tag
      const values = Array.isArray(raw) ? raw : [raw]
      const path = String(route.path || '')
      if (!isStaticPath(path)) continue

      for (const value of values) {
        const key = normalizeTagKey(value)
        if (!key) continue

        const current = byKey.get(key)
        const next: KeyEntityTagItem = {
          key,
          label: toLabel(key),
          to: path,
        }

        // Prefer canonical /<tag> paths when present.
        if (!current || isPreferredPath(key, path) || current.to !== `/${key}`) {
          byKey.set(key, next)
        }
      }
    }

    return Array.from(byKey.values())
  })

  return {
    keyEntityTags,
  }
}
