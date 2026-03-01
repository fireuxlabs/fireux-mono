import { collection, doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { ref } from 'vue'
import { useFirestore } from 'vuefire'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import {
  STITCH_PROVIDER_COLLECTION,
  type StitchProviderCreateInput,
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

function normalizeNumber(value: unknown): number | undefined {
  if (typeof value !== 'number' || Number.isNaN(value)) return undefined
  return value
}

export function useStitchProviderCreate() {
  const db = useFirestore()
  const { uid } = useAuth()

  const loading = ref(false)
  const error = ref<string | null>(null)

  const createProvider = async (input: StitchProviderCreateInput): Promise<string> => {
    if (!uid.value) {
      throw new Error('You need to be signed in to join as a provider.')
    }

    const displayName = normalizeString(input.display_name)
    if (!displayName) {
      throw new Error('Display name is required.')
    }

    loading.value = true
    error.value = null

    try {
      const providerRef = doc(collection(db, STITCH_PROVIDER_COLLECTION))
      await setDoc(providerRef, {
        id: providerRef.id,
        display_name: displayName,
        handle: normalizeString(input.handle) || null,
        type: input.type === 'agency' ? 'agency' : 'individual',
        website_url: normalizeString(input.website_url) || null,
        contact_email: normalizeString(input.contact_email) || null,
        location: normalizeString(input.location) || null,
        timezone: normalizeString(input.timezone) || null,
        languages: normalizeStringArray(input.languages),
        tags: normalizeStringArray(input.tags),
        rate_hourly_min: normalizeNumber(input.rate_hourly_min) ?? null,
        rate_hourly_max: normalizeNumber(input.rate_hourly_max) ?? null,
        availability:
          input.availability === 'limited' || input.availability === 'unavailable'
            ? input.availability
            : 'available',
        bio: normalizeString(input.bio) || null,
        linkedin_url: normalizeString(input.linkedin_url) || null,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
        created_by_uid: uid.value,
        is_verified: false,
        is_public: input.is_public !== false,
      })

      return providerRef.id
    } catch (createError) {
      error.value = createError instanceof Error ? createError.message : 'Failed to create provider.'
      throw createError
    } finally {
      loading.value = false
    }
  }

  return {
    createProvider,
    loading,
    error,
  }
}
