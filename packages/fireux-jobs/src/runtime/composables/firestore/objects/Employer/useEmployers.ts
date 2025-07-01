import type { Employer } from '../../../../models/Employer.model'
import { computed, type Ref } from 'vue'
import { doc } from 'firebase/firestore'
import { useFirestore, useDocument, useCurrentUser } from 'vuefire'
import type { DocumentReference } from 'firebase/firestore'
import { useFirestoreManager } from '../../../../../../../fireux-core/src/runtime/composables/firestore/useFirestoreManager'
import { useEmployerCreate } from './useEmployerCreate'
import { useEmployerUpdate } from './useEmployerUpdate'
import { useEmployerDelete } from './useEmployerDelete'

export function useEmployers() {
  const db = useFirestore()
  const currentUser = useCurrentUser()
  const { firestoreFetchCollection } = useFirestoreManager()

  // Reactive document reference for current user's employer profile
  const currentEmployerDocRef = computed<DocumentReference<Employer> | null>(
    () =>
      currentUser.value?.uid
        ? (doc(
            db,
            'employers',
            currentUser.value.uid
          ) as DocumentReference<Employer>)
        : null
  )

  // Reactive employer data using useDocument
  const { data: currentEmployer } = useDocument<Employer>(currentEmployerDocRef)

  // Reactive check if current user is an employer
  const isEmployer = computed(() => !!currentEmployer.value)

  // Fetch all employers collection (for listings)
  async function getEmployersCollection() {
    return await firestoreFetchCollection<Employer>('employers', {
      appScoped: false,
    })
  }

  // Fetch a specific employer by ID
  async function fetchEmployer(
    id: string
  ): Promise<Ref<Employer | null | undefined>> {
    const { firestoreFetchDoc } = useFirestoreManager()
    return (await firestoreFetchDoc('employers', id, {
      appScoped: false,
    })) as Ref<Employer | null | undefined>
  }

  const employerCreate = useEmployerCreate()
  const employerUpdate = useEmployerUpdate()
  const employerDelete = useEmployerDelete()

  return {
    isEmployer,
    employer: currentEmployer, // Alias for easier usage, like useAppUser returns appUser
    currentEmployer,
    getEmployersCollection,
    ...employerCreate,
    ...employerUpdate,
    ...employerDelete,
    fetchEmployer,
  }
}
