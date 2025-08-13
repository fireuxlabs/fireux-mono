// Generic simple object creation composable
// For objects that only need { name, slug } plus system fields

import { ref } from 'vue'
import { useCurrentUser, useFirestore } from 'vuefire'
import { doc, getDoc } from 'firebase/firestore'
import { useObjectCreate } from './useObjectCreate'

export interface SimpleObjectCreateConfig {
  collectionName: string
  /** Optional transform of slug after base generation */
  finalizeSlug?: (slug: string) => string
  /** Optional name normalization (e.g., trim / capitalization) */
  normalizeName?: (name: string) => string
}

function baseSlugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/['`]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

export function useSimpleObjectCreate(config: SimpleObjectCreateConfig) {
  const name = ref('')
  const creating = ref(false)
  const error = ref<string | null>(null)
  const justCreatedSlug = ref<string | null>(null)

  const currentUser = useCurrentUser()
  const db = useFirestore()
  const { createObject } = useObjectCreate()

  async function create() {
    if (creating.value) return null
    const raw = name.value.trim()
    if (!raw) return null
    if (!currentUser.value) {
      error.value = 'Must be signed in'
      return null
    }
    creating.value = true
    error.value = null
    try {
      const cleanName = config.normalizeName ? config.normalizeName(raw) : raw
      let slug = baseSlugify(cleanName)
      if (config.finalizeSlug) slug = config.finalizeSlug(slug)
      if (!slug) throw new Error('Invalid slug')
      // Ensure uniqueness; append incremental suffix if needed
      let candidate = slug
      let i = 2
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const snapshot = await getDoc(doc(db, config.collectionName, candidate))
        if (!snapshot.exists()) break
        candidate = `${slug}-${i++}`
        if (i > 50) throw new Error('Too many duplicates')
      }
      slug = candidate

      await createObject<any>(config.collectionName, {
        slug,
        name: cleanName,
        creator_id: currentUser.value.uid,
      } as any)
      justCreatedSlug.value = slug
      name.value = ''
      return slug
    } catch (e: any) {
      error.value = e.message || 'Failed to create'
      return null
    } finally {
      creating.value = false
    }
  }

  return {
    name,
    creating,
    error,
    justCreatedSlug,
    create,
  }
}
