import { collection, doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { ref } from 'vue'
import { useFirestore } from 'vuefire'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import {
  STITCH_REQUEST_COLLECTION,
  type StitchRequestCreateInput,
} from '../models/stitch.request.model'

function normalizeString(value: unknown): string {
  if (typeof value !== 'string') return ''
  return value.trim()
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value
    .map((entry) => normalizeString(entry))
    .filter(Boolean)
}

function normalizeNumber(value: unknown): number | undefined {
  if (typeof value !== 'number' || Number.isNaN(value)) return undefined
  return value
}

export function useStitchRequestCreate() {
  const db = useFirestore()
  const { uid } = useAuth()

  const loading = ref(false)
  const error = ref<string | null>(null)

  const createRequest = async (input: StitchRequestCreateInput): Promise<string> => {
    if (!uid.value) {
      throw new Error('You need to be signed in to request capacity.')
    }

    const title = normalizeString(input.title)
    const summary = normalizeString(input.summary)
    const scope = normalizeString(input.scope)

    if (!title || !summary || !scope) {
      throw new Error('Title, summary, and scope are required.')
    }

    loading.value = true
    error.value = null

    try {
      const requestRef = doc(collection(db, STITCH_REQUEST_COLLECTION))
      await setDoc(requestRef, {
        id: requestRef.id,
        title,
        summary,
        scope,
        tags: normalizeStringArray(input.tags),
        budget_type:
          input.budget_type === 'fixed' || input.budget_type === 'retainer'
            ? input.budget_type
            : 'hourly',
        budget_min: normalizeNumber(input.budget_min) ?? null,
        budget_max: normalizeNumber(input.budget_max) ?? null,
        start_date: normalizeString(input.start_date) || null,
        duration: normalizeString(input.duration) || null,
        timezone: normalizeString(input.timezone) || null,
        status:
          input.status === 'paused' || input.status === 'closed' ? input.status : 'open',
        created_by_uid: uid.value,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      })

      return requestRef.id
    } catch (createError) {
      error.value = createError instanceof Error ? createError.message : 'Failed to create request.'
      throw createError
    } finally {
      loading.value = false
    }
  }

  return {
    createRequest,
    loading,
    error,
  }
}
