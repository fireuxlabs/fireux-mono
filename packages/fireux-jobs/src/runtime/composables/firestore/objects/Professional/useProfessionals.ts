import type { Professional } from '../../../../models/Professional.model'
import { computed, ref, type Ref } from 'vue'
import { doc } from 'firebase/firestore'
import { useFirestore, useDocument, useCurrentUser } from 'vuefire'
import type { DocumentReference } from 'firebase/firestore'
import { useFirestoreManager } from '../../../../../../../fireux-core/src/runtime/composables/firestore/useFirestoreManager'
import { useProfessionalCreate } from './useProfessionalCreate'
import { useProfessionalUpdate } from './useProfessionalUpdate'
import { useProfessionalDelete } from './useProfessionalDelete'

export function useProfessionals() {
  const db = useFirestore()
  const currentUser = useCurrentUser()
  const { firestoreFetchCollection } = useFirestoreManager()

  // Reactive document reference for current user's professional profile
  const currentProfessionalDocRef =
    computed<DocumentReference<Professional> | null>(() =>
      currentUser.value?.uid
        ? (doc(
            db,
            'professionals',
            currentUser.value.uid
          ) as DocumentReference<Professional>)
        : null
    )

  // Reactive professional data using useDocument
  const { data: currentProfessional } = useDocument<Professional>(
    currentProfessionalDocRef
  )

  // Reactive check if current user is a professional
  const isProfessional = computed(() => !!currentProfessional.value)

  // Reactive professionals collection
  const professionals = firestoreFetchCollection<Professional>(
    'professionals',
    {
      appScoped: false,
    }
  )

  // Fetch a specific professional by ID
  async function fetchProfessional(
    id: string
  ): Promise<Ref<Professional | null | undefined>> {
    const { firestoreFetchDoc } = useFirestoreManager()
    return (await firestoreFetchDoc('professionals', id, {
      appScoped: false,
    })) as Ref<Professional | null | undefined>
  }

  const professionalCreate = useProfessionalCreate()
  const professionalUpdate = useProfessionalUpdate()
  const professionalDelete = useProfessionalDelete()

  return {
    isProfessional,
    professional: currentProfessional,
    currentProfessional,
    professionals,
    ...professionalCreate,
    ...professionalUpdate,
    ...professionalDelete,
    fetchProfessional,
  }
}
