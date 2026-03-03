import { collection, doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { ref } from 'vue'
import { useFirestore } from 'vuefire'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { STITCH_REQUEST_COLLECTION, type StitchRequestCreateInput } from '../models/stitch.request.model'

function text(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function textList(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.map((entry) => text(entry)).filter(Boolean)
}

function numeric(value: unknown): number | null {
  return typeof value === 'number' && !Number.isNaN(value) ? value : null
}

export function useStitchRequestCreate() {
  const db = useFirestore()
  const { uid } = useAuth()
  const loading = ref(false)
  const error = ref<string | null>(null)

  const createRequest = async (input: StitchRequestCreateInput): Promise<string> => {
    if (!uid.value) throw new Error('You need to be signed in to request capacity.')

    const title = text(input.title)
    const summary = text(input.summary)
    const scope = text(input.scope)

    if (!title || !summary || !scope) throw new Error('Title, summary, and scope are required.')

    loading.value = true
    error.value = null

    try {
      const requestRef = doc(collection(db, STITCH_REQUEST_COLLECTION))
      await setDoc(requestRef, {
        id: requestRef.id,
        title,
        summary,
        scope,
        tags: textList(input.tags),
        budget_type: input.budget_type === 'fixed' || input.budget_type === 'retainer' ? input.budget_type : 'hourly',
        budget_min: numeric(input.budget_min),
        budget_max: numeric(input.budget_max),
        start_date: text(input.start_date) || null,
        duration: text(input.duration) || null,
        timezone: text(input.timezone) || null,
        status: input.status === 'paused' || input.status === 'closed' ? input.status : 'open',
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

  return { createRequest, loading, error }
}
