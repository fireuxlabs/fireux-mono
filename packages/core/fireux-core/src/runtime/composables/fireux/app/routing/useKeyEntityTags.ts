import { computed } from 'vue'
import { useRouter } from 'vue-router'

const toLabel = (value: string) =>
  value
    .split(/[-_]+/)
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(' ')

export function useKeyEntityTags() {
  const router = useRouter()

  const keyEntityTags = computed(() => {
    const seen = new Set<string>()
    const tags: string[] = []

    for (const route of router.getRoutes()) {
      const meta = route.meta as Record<string, unknown>
      const raw = meta?.keyEntitiesTag
      const values = Array.isArray(raw) ? raw : [raw]

      for (const value of values) {
        const normalized = String(value ?? '').trim().toLowerCase()
        if (!normalized || seen.has(normalized)) continue
        seen.add(normalized)
        tags.push(toLabel(normalized))
      }
    }

    return tags
  })

  return {
    keyEntityTags,
  }
}
