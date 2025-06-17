import { ref, computed } from 'vue'
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, where, orderBy, limit, startAfter } from 'firebase/firestore'
import { useFirestore, useCurrentUser } from 'vuefire'
import type { Job, JobSearchFilters, JobSearchResult } from '../types'

export const useJobs = () => {
  const db = useFirestore()
  const user = useCurrentUser()
  const config = useRuntimeConfig()
  
  const jobs = ref<Job[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const jobsCollection = collection(db, config.public.fireuxJobs.collections.jobs)

  /**
   * Create a new job posting
   */
  const createJob = async (jobData: Omit<Job, 'id' | 'postedAt' | 'applicationsCount' | 'viewsCount' | 'postedBy'>) => {
    if (!user.value) {
      throw new Error('User must be authenticated to post jobs')
    }

    loading.value = true
    error.value = null

    try {
      const newJob: Omit<Job, 'id'> = {
        ...jobData,
        postedBy: user.value.uid,
        postedAt: new Date(),
        applicationsCount: 0,
        viewsCount: 0,
        status: 'active'
      }

      const docRef = await addDoc(jobsCollection, newJob)
      return docRef.id
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create job'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Update an existing job
   */
  const updateJob = async (jobId: string, updates: Partial<Job>) => {
    if (!user.value) {
      throw new Error('User must be authenticated to update jobs')
    }

    loading.value = true
    error.value = null

    try {
      const jobRef = doc(db, config.public.fireuxJobs.collections.jobs, jobId)
      await updateDoc(jobRef, updates)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update job'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Delete a job
   */
  const deleteJob = async (jobId: string) => {
    if (!user.value) {
      throw new Error('User must be authenticated to delete jobs')
    }

    loading.value = true
    error.value = null

    try {
      const jobRef = doc(db, config.public.fireuxJobs.collections.jobs, jobId)
      await deleteDoc(jobRef)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete job'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Get jobs posted by current user
   */
  const getMyJobs = async () => {
    if (!user.value) {
      throw new Error('User must be authenticated to view their jobs')
    }

    loading.value = true
    error.value = null

    try {
      const q = query(
        jobsCollection,
        where('postedBy', '==', user.value.uid),
        orderBy('postedAt', 'desc')
      )
      
      const querySnapshot = await getDocs(q)
      jobs.value = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Job[]
      
      return jobs.value
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch jobs'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Search and filter jobs
   */
  const searchJobs = async (filters: JobSearchFilters = {}, page = 1, pageSize = 20): Promise<JobSearchResult> => {
    loading.value = true
    error.value = null

    try {
      let q = query(jobsCollection, where('status', '==', 'active'))

      // Apply filters
      if (filters.category) {
        q = query(q, where('category', '==', filters.category))
      }
      
      if (filters.employmentType) {
        q = query(q, where('employmentType', '==', filters.employmentType))
      }
      
      if (filters.remote !== undefined) {
        q = query(q, where('location.remote', '==', filters.remote))
      }

      // Apply ordering and pagination
      q = query(q, orderBy('postedAt', 'desc'), limit(pageSize))

      const querySnapshot = await getDocs(q)
      const jobsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Job[]

      // Apply client-side filters for complex queries
      let filteredJobs = jobsData

      if (filters.query) {
        const searchTerm = filters.query.toLowerCase()
        filteredJobs = filteredJobs.filter(job => 
          job.title.toLowerCase().includes(searchTerm) ||
          job.company.toLowerCase().includes(searchTerm) ||
          job.description.toLowerCase().includes(searchTerm)
        )
      }

      if (filters.salaryMin) {
        filteredJobs = filteredJobs.filter(job => job.salary.min >= filters.salaryMin!)
      }

      if (filters.salaryMax) {
        filteredJobs = filteredJobs.filter(job => job.salary.max <= filters.salaryMax!)
      }

      if (filters.location) {
        const locationTerm = filters.location.toLowerCase()
        filteredJobs = filteredJobs.filter(job => 
          job.location.city.toLowerCase().includes(locationTerm) ||
          job.location.state.toLowerCase().includes(locationTerm) ||
          job.location.country.toLowerCase().includes(locationTerm)
        )
      }

      jobs.value = filteredJobs

      return {
        jobs: filteredJobs,
        total: filteredJobs.length,
        page,
        limit: pageSize,
        hasMore: filteredJobs.length === pageSize
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to search jobs'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    jobs: readonly(jobs),
    loading: readonly(loading),
    error: readonly(error),
    createJob,
    updateJob,
    deleteJob,
    getMyJobs,
    searchJobs
  }
}
