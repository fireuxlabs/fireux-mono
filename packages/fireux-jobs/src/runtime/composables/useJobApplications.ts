import { ref, computed } from 'vue'
import { collection, addDoc, updateDoc, getDocs, query, where, orderBy } from 'firebase/firestore'
import { useFirestore, useCurrentUser } from 'vuefire'
import type { JobApplication } from '../types'

export const useJobApplications = () => {
  const db = useFirestore()
  const user = useCurrentUser()
  const config = useRuntimeConfig()
  
  const applications = ref<JobApplication[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const applicationsCollection = collection(db, config.public.fireuxJobs.collections.applications)

  /**
   * Apply for a job
   */
  const applyForJob = async (jobId: string, applicationData: Pick<JobApplication, 'coverLetter' | 'resume' | 'customFields'>) => {
    if (!user.value) {
      throw new Error('User must be authenticated to apply for jobs')
    }

    loading.value = true
    error.value = null

    try {
      // Check if user has already applied for this job
      const existingApplicationQuery = query(
        applicationsCollection,
        where('jobId', '==', jobId),
        where('applicantId', '==', user.value.uid)
      )
      
      const existingApplications = await getDocs(existingApplicationQuery)
      
      if (!existingApplications.empty) {
        throw new Error('You have already applied for this job')
      }

      const newApplication: Omit<JobApplication, 'id'> = {
        jobId,
        applicantId: user.value.uid,
        appliedAt: new Date(),
        status: 'pending',
        ...applicationData
      }

      const docRef = await addDoc(applicationsCollection, newApplication)
      return docRef.id
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to submit application'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Get applications for current user (job seeker)
   */
  const getMyApplications = async () => {
    if (!user.value) {
      throw new Error('User must be authenticated to view applications')
    }

    loading.value = true
    error.value = null

    try {
      const q = query(
        applicationsCollection,
        where('applicantId', '==', user.value.uid),
        orderBy('appliedAt', 'desc')
      )
      
      const querySnapshot = await getDocs(q)
      applications.value = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as JobApplication[]
      
      return applications.value
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch applications'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Get applications for a specific job (employer view)
   */
  const getJobApplications = async (jobId: string) => {
    if (!user.value) {
      throw new Error('User must be authenticated to view job applications')
    }

    loading.value = true
    error.value = null

    try {
      const q = query(
        applicationsCollection,
        where('jobId', '==', jobId),
        orderBy('appliedAt', 'desc')
      )
      
      const querySnapshot = await getDocs(q)
      const jobApplications = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as JobApplication[]
      
      return jobApplications
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch job applications'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Update application status (employer action)
   */
  const updateApplicationStatus = async (
    applicationId: string, 
    status: JobApplication['status'],
    employerNotes?: string
  ) => {
    if (!user.value) {
      throw new Error('User must be authenticated to update applications')
    }

    loading.value = true
    error.value = null

    try {
      const updates: Partial<JobApplication> = {
        status,
        reviewedAt: new Date(),
        reviewedBy: user.value.uid
      }
      
      if (employerNotes) {
        updates.employerNotes = employerNotes
      }

      const applicationRef = doc(db, config.public.fireuxJobs.collections.applications, applicationId)
      await updateDoc(applicationRef, updates)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update application'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Check if user has applied for a specific job
   */
  const hasAppliedForJob = async (jobId: string): Promise<boolean> => {
    if (!user.value) return false

    try {
      const q = query(
        applicationsCollection,
        where('jobId', '==', jobId),
        where('applicantId', '==', user.value.uid)
      )
      
      const querySnapshot = await getDocs(q)
      return !querySnapshot.empty
    } catch (err) {
      console.error('Error checking application status:', err)
      return false
    }
  }

  // Computed properties for application statistics
  const applicationStats = computed(() => {
    const stats = {
      pending: 0,
      reviewed: 0,
      shortlisted: 0,
      rejected: 0,
      hired: 0,
      total: applications.value.length
    }

    applications.value.forEach(app => {
      stats[app.status]++
    })

    return stats
  })

  return {
    applications: readonly(applications),
    loading: readonly(loading),
    error: readonly(error),
    applicationStats,
    applyForJob,
    getMyApplications,
    getJobApplications,
    updateApplicationStatus,
    hasAppliedForJob
  }
}
