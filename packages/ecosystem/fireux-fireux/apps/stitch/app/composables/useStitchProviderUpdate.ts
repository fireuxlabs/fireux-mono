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

export function useStitchProviderUpdate() {
  const db = useFirestore()
  const { uid } = useAuth()
  const { isAdmin } = useUser()
  const loading = ref(false)
  const error = ref<string | null>(null)

  const updateProvider = async (providerId: string, updates: StitchProviderUpdateInput): Promise<void> => {
    const id = text(providerId)
    if (!id) throw new Error('Provider id is required.')
    if (!uid.value) throw new Error('You need to be signed in to edit a provider profile.')

    loading.value = true
    error.value = null

    try {
      const ref = doc(db, STITCH_PROVIDER_COLLECTION, id)
      const snap = await getDoc(ref)
      if (!snap.exists()) throw new Error('Provider not found.')

      const current = snap.data() as StitchProvider
      const canEdit = current.created_by_uid === uid.value || isAdmin.value
      if (!canEdit) throw new Error('You can only edit provider profiles that you manage.')

      const patch: Record<string, unknown> = {}
      add(patch, 'display_name', text(updates.display_name) || undefined)
      add(patch, 'handle', text(updates.handle) || null)
      add(patch, 'type', updates.type === 'agency' || updates.type === 'individual' ? updates.type : undefined)
      add(patch, 'website_url', text(updates.website_url) || null)
      add(patch, 'contact_email', text(updates.contact_email) || null)
      add(patch, 'location', text(updates.location) || null)
      add(patch, 'timezone', text(updates.timezone) || null)
      add(patch, 'languages', updates.languages ? textList(updates.languages) : undefined)
      add(patch, 'tags', updates.tags ? textList(updates.tags) : undefined)
      add(patch, 'rate_hourly_min', numberOrNull(updates.rate_hourly_min))
      add(patch, 'rate_hourly_max', numberOrNull(updates.rate_hourly_max))
      add(
        patch,
        'availability',
        updates.availability === 'available' || updates.availability === 'limited' || updates.availability === 'unavailable'
          ? updates.availability
          : undefined
      )
      add(patch, 'bio', text(updates.bio) || null)
      add(patch, 'linkedin_url', text(updates.linkedin_url) || null)

      if (isAdmin.value) {
        add(patch, 'is_verified', updates.is_verified)
        add(patch, 'is_public', updates.is_public)
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

  return { updateProvider, loading, error }
}
