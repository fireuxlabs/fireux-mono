import { useCurrentUser } from 'vuefire'
import { useFirestoreManager } from 'fireux-core/runtime/composables/firestore/useFirestoreManager'
import { useNuxtApp } from 'nuxt/app'
import { serverTimestamp } from 'firebase/firestore'
import type { Job } from '../../../../models/objects/Job.model'

export function useJobCreate() {
  const { setDocument } = useFirestoreManager()
  const currentUser = useCurrentUser()
  const { $firexConfig } = useNuxtApp()

  async function createJob(
    jobData: Omit<
      Job,
      'slug' | 'appId' | 'creator_id' | 'created_at' | 'updated_at'
    >
  ): Promise<boolean> {
    try {
      if (!currentUser.value) {
        throw new Error('No authenticated user found.')
      }

      if (!jobData.title) {
        throw new Error('Job title is required.')
      }

      // Generate slug from title
      const slug =
        jobData.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '') +
        '-' +
        Date.now()

      // Prepare job data with system fields
      const completeJobData: Job = {
        ...jobData,
        slug,
        appId: ($firexConfig as any)?.app?.id || 'default',
        creator_id: currentUser.value.uid,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      }

      // Use slug as document ID for consistent addressing
      await setDocument('jobs', slug, completeJobData)

      console.log(`✅ Job created successfully with slug: ${slug}`)
      return true
    } catch (error) {
      console.error('❌ Error creating job:', error)
      throw error
    }
  }

  return { createJob }
}
