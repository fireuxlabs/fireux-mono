import { ref, computed } from 'vue'
import { collection, query, orderBy, limit } from 'firebase/firestore'
import { useFirestore, useCollection } from 'vuefire'
import type { Supplier } from '../../../../models/profiles/Supplier.model'

export const useSupplierList = () => {
  const db = useFirestore()

  // Fetch suppliers
  const suppliersQuery = query(
    collection(db, 'suppliers'),
    orderBy('business_name'),
    limit(50) // Limit for performance
  )

  const {
    data: suppliers,
    pending: loading,
    error,
  } = useCollection(suppliersQuery)

  // Convert to typed array with proper formatting
  const suppliersList = computed(() => {
    if (!suppliers.value) return []

    return suppliers.value.map((doc) => ({
      id: doc.id,
      business_name: doc.business_name || 'Unnamed Supplier',
      business_type: doc.business_type || 'other',
      verified: doc.verified || false,
      ...doc,
    })) as Supplier[]
  })

  // Formatted for dropdown options
  const supplierOptions = computed(() => [
    { value: '', label: 'No supplier (generic ingredient)' },
    ...suppliersList.value.map((supplier) => ({
      value: supplier.id,
      label: `${supplier.business_name}${supplier.verified ? ' ✓' : ''}`,
      supplier,
    })),
  ])

  return {
    suppliers: suppliersList,
    supplierOptions,
    loading,
    error,
  }
}
