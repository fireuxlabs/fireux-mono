import { doc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore'
import { ref } from 'vue'
import { useFirestore } from 'vuefire'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser'
import {
  STITCH_REQUEST_COLLECTION,
  type StitchRequest,
  type StitchRequestUpdateInput,
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

function normalizeNumber(value: unknown): number | null | undefined {
  if (value === null) return null
  if (value === undefined) return undefined
  if (typeof value !== 'number' || Number.isNaN(value)) return null
  return value
}

function addPatchValue(
  patch: Record<string, unknown>,
  key: string,
  value: string | number | string[] | null | undefined
) {
  if (value === undefined) return
  patch[key] = value
}

export function useStitchRequestUpdate() {
  const db = useFirestore()
  const { uid } = useAuth()
  const { isAdmin } = useUser()

  const loading = ref(false)
  const error = ref<string | null>(null)

  const updateRequest = async (
    requestId: string,
    updates: StitchRequestUpdateInput
  ): Promise<void> => {
    const trimmedId = normalizeString(requestId)
    if (!trimmedId) throw new Error('Request id is required.')
    if (!uid.value) throw new Error('You need to be signed in to update a capacity request.')

    loading.value = true
    error.value = null

    try {
      const ref = doc(db, STITCH_REQUEST_COLLECTION, trimmedId)
      const snap = await getDoc(ref)

      if (!snap.exists()) {
        throw new Error('Request not found.')
      }

      const current = snap.data() as StitchRequest
      const isOwner = current.created_by_uid === uid.value

      if (!isOwner && !isAdmin.value) {
        throw new Error('You can only edit requests that you created.')
      }

      const patch: Record<string, unknown> = {}

      addPatchValue(patch, 'title', normalizeString(updates.title) || undefined)
      addPatchValue(patch, 'summary', normalizeString(updates.summary) || undefined)
      addPatchValue(patch, 'scope', normalizeString(updates.scope) || undefined)
      addPatchValue(patch, 'tags', updates.tags ? normalizeStringArray(updates.tags) : undefined)
      addPatchValue(
        patch,
        'budget_type',
        updates.budget_type === 'hourly' ||
          updates.budget_type === 'fixed' ||
          updates.budget_type === 'retainer'
          ? updates.budget_type
          : undefined
      )
      addPatchValue(patch, 'budget_min', normalizeNumber(updates.budget_min))
      addPatchValue(patch, 'budget_max', normalizeNumber(updates.budget_max))
      addPatchValue(patch, 'start_date', normalizeString(updates.start_date) || null)
      addPatchValue(patch, 'duration', normalizeString(updates.duration) || null)
      addPatchValue(patch, 'timezone', normalizeString(updates.timezone) || null)
      addPatchValue(
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

  return {
    updateRequest,
    loading,
    error,
  }
}
