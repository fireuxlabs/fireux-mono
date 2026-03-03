import { doc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore'
import { ref } from 'vue'
import { useFirestore } from 'vuefire'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser'
import { STITCH_REQUEST_COLLECTION, type StitchRequest, type StitchRequestUpdateInput } from '../models/stitch.request.model'

function text(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function textList(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.map((entry) => text(entry)).filter(Boolean)
}

function numberOrNull(value: unknown): number | null | undefined {
  if (value === undefined) return undefined
  return typeof value === 'number' && !Number.isNaN(value) ? value : null
}

function add(patch: Record<string, unknown>, key: string, value: unknown) {
  if (value === undefined) return
  patch[key] = value
}

export function useStitchRequestUpdate() {
  const db = useFirestore()
  const { uid } = useAuth()
  const { isAdmin } = useUser()
  const loading = ref(false)
  const error = ref<string | null>(null)

  const updateRequest = async (requestId: string, updates: StitchRequestUpdateInput): Promise<void> => {
    const id = text(requestId)
    if (!id) throw new Error('Request id is required.')
    if (!uid.value) throw new Error('You need to be signed in to update a capacity request.')

    loading.value = true
    error.value = null

    try {
      const ref = doc(db, STITCH_REQUEST_COLLECTION, id)
      const snap = await getDoc(ref)
      if (!snap.exists()) throw new Error('Request not found.')

      const current = snap.data() as StitchRequest
      const canEdit = current.created_by_uid === uid.value || isAdmin.value
      if (!canEdit) throw new Error('You can only edit requests that you created.')

      const patch: Record<string, unknown> = {}
      add(patch, 'title', text(updates.title) || undefined)
      add(patch, 'summary', text(updates.summary) || undefined)
      add(patch, 'scope', text(updates.scope) || undefined)
      add(patch, 'tags', updates.tags ? textList(updates.tags) : undefined)
      add(
        patch,
        'budget_type',
        updates.budget_type === 'hourly' || updates.budget_type === 'fixed' || updates.budget_type === 'retainer'
          ? updates.budget_type
          : undefined
      )
      add(patch, 'budget_min', numberOrNull(updates.budget_min))
      add(patch, 'budget_max', numberOrNull(updates.budget_max))
      add(patch, 'start_date', text(updates.start_date) || null)
      add(patch, 'duration', text(updates.duration) || null)
      add(patch, 'timezone', text(updates.timezone) || null)
      add(
        patch,
        'status',
        updates.status === 'open' || updates.status === 'paused' || updates.status === 'closed'
          ? updates.status
          : undefined
      )

      patch.updated_at = serverTimestamp()
      await updateDoc(ref, patch)
    } catch (updateError) {
      error.value = updateError instanceof Error ? updateError.message : 'Failed to update request.'
      throw updateError
    } finally {
      loading.value = false
    }
  }

  return { updateRequest, loading, error }
}
