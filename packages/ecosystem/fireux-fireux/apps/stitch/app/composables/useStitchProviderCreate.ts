import { collection, doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { ref } from 'vue'
import { useFirestore } from 'vuefire'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { STITCH_PROVIDER_COLLECTION, type StitchProviderCreateInput } from '../models/stitch.provider.model'

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

export function useStitchProviderCreate() {
  const db = useFirestore()
  const { uid } = useAuth()
  const loading = ref(false)
  const error = ref<string | null>(null)

  const createProvider = async (input: StitchProviderCreateInput): Promise<string> => {
    if (!uid.value) throw new Error('You need to be signed in to join as a provider.')

    const displayName = text(input.display_name)
    if (!displayName) throw new Error('Display name is required.')

    loading.value = true
    error.value = null

    try {
      const providerRef = doc(collection(db, STITCH_PROVIDER_COLLECTION))
      await setDoc(providerRef, {
        id: providerRef.id,
        display_name: displayName,
        handle: text(input.handle) || null,
        type: input.type === 'agency' ? 'agency' : 'individual',
        website_url: text(input.website_url) || null,
        contact_email: text(input.contact_email) || null,
        location: text(input.location) || null,
        timezone: text(input.timezone) || null,
        languages: textList(input.languages),
        tags: textList(input.tags),
        rate_hourly_min: numeric(input.rate_hourly_min),
        rate_hourly_max: numeric(input.rate_hourly_max),
        availability: input.availability === 'limited' || input.availability === 'unavailable' ? input.availability : 'available',
        bio: text(input.bio) || null,
        linkedin_url: text(input.linkedin_url) || null,
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

  return { createProvider, loading, error }
}
