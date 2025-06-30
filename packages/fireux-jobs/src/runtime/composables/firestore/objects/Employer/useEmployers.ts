import type { Employer } from '../../../../models/Employer.model'
import { ref, type Ref } from 'vue'
import { useFirestoreManager } from '../../../../../../../fireux-core/src/runtime/composables/firestore/useFirestoreManager'
import { useEmployerCreate } from './useEmployerCreate'
import { useEmployerUpdate } from './useEmployerUpdate'
import { useEmployerDelete } from './useEmployerDelete'

export async function useEmployers() {
  const { firestoreFetchCollection, firestoreFetchDoc } = useFirestoreManager()

  // Fetch all employers (global, not app-scoped)
  const employersCollection =
    (await firestoreFetchCollection<Employer>('employers', {
      appScoped: false,
    })) || ref([])

  async function fetchEmployer(
    id: string
  ): Promise<Ref<Employer | null | undefined>> {
    return (await firestoreFetchDoc('employers', id, {
      appScoped: false,
    })) as Ref<Employer | null | undefined>
  }

  const employerCreate = useEmployerCreate()
  const employerUpdate = useEmployerUpdate()
  const employerDelete = useEmployerDelete()

  // Simple boolean for onboarding logic (replace with real logic later)
  const isEmployer = false

  return {
    isEmployer,
    employersCollection,
    ...employerCreate,
    ...employerUpdate,
    ...employerDelete,
    fetchEmployer,
  }
}
