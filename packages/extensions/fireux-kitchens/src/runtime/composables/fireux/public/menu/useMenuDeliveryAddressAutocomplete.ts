import { computed, ref, watch, type Ref } from 'vue'

export type MenuDeliveryAddressPrediction = {
  place_id: string
  description: string
  structured_formatting?: {
    main_text?: string
    secondary_text?: string
  }
  types?: string[]
}

const text = (value: unknown) => String(value ?? '').trim()

export function useMenuDeliveryAddressAutocomplete(query: Ref<string>) {
  const predictions = ref<MenuDeliveryAddressPrediction[]>([])
  const pending = ref(false)
  const error = ref('')
  const canSearch = computed(() => text(query.value).length >= 3)
  let timer: ReturnType<typeof setTimeout> | null = null
  let runId = 0

  watch(query, () => {
    if (timer) clearTimeout(timer)
    error.value = ''

    if (!canSearch.value) {
      predictions.value = []
      pending.value = false
      return
    }

    timer = setTimeout(() => {
      void search()
    }, 220)
  })

  async function search() {
    const currentRun = ++runId
    const value = text(query.value)
    if (!value) return

    pending.value = true
    try {
      const url = new URL('/api/places/autocomplete', window.location.origin)
      url.searchParams.set('q', value)
      url.searchParams.set('type', 'address')

      const response = await fetch(url, {
        headers: { accept: 'application/json' },
      })
      const json = await response.json()
      if (currentRun !== runId) return
      if (!response.ok || json?.error) {
        error.value = 'Address suggestions are not available right now.'
        predictions.value = []
        return
      }

      predictions.value = Array.isArray(json?.predictions)
        ? json.predictions.map(cleanPrediction).filter(Boolean)
        : []
    } catch {
      if (currentRun !== runId) return
      error.value = 'Address suggestions are not available right now.'
      predictions.value = []
    } finally {
      if (currentRun === runId) pending.value = false
    }
  }

  return {
    predictions,
    pending,
    error,
    canSearch,
  }
}

function cleanPrediction(value: unknown): MenuDeliveryAddressPrediction | null {
  const row = value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, any>
    : {}
  const placeId = text(row.place_id)
  const description = text(row.description)
  if (!placeId || !description) return null

  return {
    place_id: placeId,
    description,
    structured_formatting: {
      main_text: text(row.structured_formatting?.main_text),
      secondary_text: text(row.structured_formatting?.secondary_text),
    },
    types: Array.isArray(row.types) ? row.types.map(text).filter(Boolean) : [],
  }
}
