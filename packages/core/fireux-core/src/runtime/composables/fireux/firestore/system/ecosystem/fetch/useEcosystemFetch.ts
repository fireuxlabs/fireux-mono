import { computed } from 'vue'
import type { EcosystemSurface } from '../utils/view/useEcosystemInterface'
import { useFirestoreRead } from '../../../operations/useFirestoreRead'

export function useEcosystemFetch(id: string | { value: string }) {
  const { firestoreFetchDoc } = useFirestoreRead()

  const ecosystemId = computed(() =>
    typeof id === 'string' ? String(id || '').trim() : String(id.value || '').trim()
  )

  const source = computed(() => {
    if (!ecosystemId.value) return null
    return firestoreFetchDoc<EcosystemSurface>('ecosystems', ecosystemId.value)
  })

  const ecosystem = computed(() => {
    const entry = source.value?.value
    if (!ecosystemId.value || !entry) return null
    return {
      ...entry,
      id: String(entry.id || ecosystemId.value).trim(),
    }
  })

  const pending = computed(() => {
    if (!ecosystemId.value) return false
    return source.value?.value === undefined
  })

  return {
    ecosystem,
    pending,
  }
}
