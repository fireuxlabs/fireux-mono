import { doc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore'
import { ref } from 'vue'
import { useFirestore } from 'vuefire'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser'
import {
  STITCH_PROVIDER_COLLECTION,
  type StitchProvider,
  type StitchProviderUpdateInput,
} from '../models/stitch.provider.model'

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
  value: string | number | boolean | string[] | null | undefined
) {
  if (value === undefined) return
  patch[key] = value
}

export function useStitchProviderUpdate() {
  const db = useFirestore()
  const { uid } = useAuth()
  const { isAdmin } = useUser()

  const loading = ref(false)
  const error = ref<string | null>(null)

  const updateProvider = async (
    providerId: string,
    updates: StitchProviderUpdateInput
  ): Promise<void> => {
    const trimmedId = normalizeString(providerId)
    if (!trimmedId) throw new Error('Provider id is required.')
    if (!uid.value) throw new Error('You need to be signed in to update a provider profile.')

    loading.value = true
    error.value = null

    try {
      const ref = doc(db, STITCH_PROVIDER_COLLECTION, trimmedId)
      const snap = await getDoc(ref)

      if (!snap.exists()) {
        throw new Error('Provider not found.')
      }

      const current = snap.data() as StitchProvider
      const isOwner = current.created_by_uid === uid.value

      if (!isOwner && !isAdmin.value) {
        throw new Error('You can only edit provider profiles that you manage.')
      }

      const patch: Record<string, unknown> = {}

      addPatchValue(patch, 'display_name', normalizeString(updates.display_name) || undefined)
      addPatchValue(patch, 'handle', normalizeString(updates.handle) || null)
      addPatchValue(
        patch,
        'type',
        updates.type === 'agency' || updates.type === 'individual' ? updates.type : undefined
      )
      addPatchValue(patch, 'website_url', normalizeString(updates.website_url) || null)
      addPatchValue(patch, 'contact_email', normalizeString(updates.contact_email) || null)
      addPatchValue(patch, 'location', normalizeString(updates.location) || null)
      addPatchValue(patch, 'timezone', normalizeString(updates.timezone) || null)
      addPatchValue(patch, 'languages', updates.languages ? normalizeStringArray(updates.languages) : undefined)
      addPatchValue(patch, 'tags', updates.tags ? normalizeStringArray(updates.tags) : undefined)
      addPatchValue(patch, 'rate_hourly_min', normalizeNumber(updates.rate_hourly_min))
      addPatchValue(patch, 'rate_hourly_max', normalizeNumber(updates.rate_hourly_max))
      addPatchValue(
        patch,
        'availability',
        updates.availability === 'available' ||
          updates.availability === 'limited' ||
          updates.availability === 'unavailable'
          ? updates.availability
          : undefined
      )
      addPatchValue(patch, 'bio', normalizeString(updates.bio) || null)
      addPatchValue(patch, 'linkedin_url', normalizeString(updates.linkedin_url) || null)

      if (isAdmin.value) {
        addPatchValue(patch, 'is_verified', updates.is_verified)
        addPatchValue(patch, 'is_public', updates.is_public)
      }

      patch.updated_at = serverTimestamp()

      await updateDoc(ref, patch)
    } catch (updateError) {
      error.value = updateError instanceof Error ? updateError.message : 'Failed to update provider.'
      throw updateError
    } finally {
      loading.value = false
    }
  }

  return {
    updateProvider,
    loading,
    error,
  }
}
