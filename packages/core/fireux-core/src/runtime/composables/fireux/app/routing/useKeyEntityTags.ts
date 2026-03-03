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

export function useKeyEntityTags() {
  const router = useRouter()

  const keyEntityTags = computed(() => {
    const byKey = new Map<string, KeyEntityTagItem>()

    for (const route of router.getRoutes()) {
      const meta = route.meta as Record<string, unknown>
      const raw = meta?.keyEntitiesTag
      const values = Array.isArray(raw) ? raw : [raw]

      for (const value of values) {
        const normalized = String(value ?? '').trim().toLowerCase()
        if (!normalized) continue
        if (!String(route.path || '').startsWith('/')) continue
        if (byKey.has(normalized)) continue

        byKey.set(normalized, {
          key: normalized,
          label: toLabel(normalized),
          to: String(route.path),
        })
      }
    }

    return Array.from(byKey.values())
  })

  return {
    keyEntityTags,
  }
}
