// ~/composables/firestore/objects/useObjectCreate.ts

import { useFirestoreManager } from '../useFirestoreManager'
import { useCurrentUser } from 'vuefire'
import { serverTimestamp } from 'firebase/firestore'
import type {
  FirestoreObject,
  ObjectInput,
} from '../../../models/objects/object.model'
import { useNuxtApp } from 'nuxt/app'

export function useObjectCreate() {
  const { setDocument } = useFirestoreManager()
  const currentUser = useCurrentUser()
  const { $firexConfig } = useNuxtApp()

  async function createObject<T extends FirestoreObject>(
    collectionName: string,
    data: ObjectInput<T>
  ): Promise<boolean> {
    try {
      if (!currentUser.value) {
        throw new Error('No authenticated user found.')
      }

      if (!data.slug) {
        throw new Error('Slug is required for object creation.')
      }

      // Prepare object data with system fields
      const objectData = {
        ...data,
        appId: ($firexConfig as any)?.app?.id || 'default',
        creator_id: currentUser.value.uid,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      }

      // Use slug as document ID for consistent addressing
      await setDocument(collectionName, data.slug, objectData)

      console.log(
        `✅ ${collectionName} object created successfully with slug: ${data.slug}`
      )
      return true
    } catch (error) {
      console.error(`❌ Error creating ${collectionName} object:`, error)
      throw error
    }
  }

  return { createObject }
}
