import type { Supplier } from '../../../../models/Supplier.model'
import { computed, readonly } from 'vue'
import { doc, collection } from 'firebase/firestore'
import {
  useFirestore,
  useDocument,
  useCurrentUser,
  useCollection,
} from 'vuefire'
import type { DocumentReference } from 'firebase/firestore'
import { useSupplierCreate } from './useSupplierCreate'
import { useSupplierUpdate } from './useSupplierUpdate'
import { useSupplierDelete } from './useSupplierDelete'

export function useSuppliers() {
  const db = useFirestore()
  const currentUser = useCurrentUser()

  // Reactive document reference for current user's supplier profile
  const currentSupplierDocRef = computed<DocumentReference<Supplier> | null>(
    () =>
      currentUser.value?.uid
        ? (doc(
            db,
            'suppliers',
            currentUser.value.uid
          ) as DocumentReference<Supplier>)
        : null
  )

  // Reactive supplier data using useDocument
  const { data: currentSupplier } = useDocument<Supplier>(currentSupplierDocRef)

  // Collection data
  const suppliersCollection = collection(db, 'suppliers')
  const { data: suppliers } = useCollection<Supplier>(suppliersCollection)

  // Child composables
  const supplierCreate = useSupplierCreate()
  const supplierUpdate = useSupplierUpdate()
  const supplierDelete = useSupplierDelete()

  // Computed properties
  const hasSupplier = computed(() => !!currentSupplier.value)
  const isSupplier = computed(() => !!currentSupplier.value)

  return {
    // State
    currentSupplier: readonly(currentSupplier),
    suppliers: readonly(suppliers),

    // Computed
    hasSupplier,
    isSupplier,

    // Child composables
    ...supplierCreate,
    ...supplierUpdate,
    ...supplierDelete,
  }
}
