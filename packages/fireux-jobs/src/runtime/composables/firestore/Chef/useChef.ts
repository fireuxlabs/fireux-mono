import { ref, computed } from 'vue'
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
} from 'firebase/firestore'
import { useFirestore } from 'vuefire'
import { waitForCurrentUser } from '../../auth/useAuth'
import { useChefCreate } from './useChefCreate'
import { useChefUpdate } from './useChefUpdate'
import { useChefDelete } from './useChefDelete'

export function useChef() {
  const db = useFirestore()

  // State
  const chef = ref(null)
  const chefs = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Child composables
  const { createChef, creating } = useChefCreate()
  const { updateChef, updating } = useChefUpdate()
  const { deleteChef, deleting } = useChefDelete()

  // Get current user's chef profile
  const fetchCurrentChef = async () => {
    loading.value = true
    error.value = null

    try {
      const user = await waitForCurrentUser()
      if (!user) {
        throw new Error('No authenticated user found')
      }

      const chefQuery = query(
        collection(db, 'chefs'),
        where('uid', '==', user.uid)
      )

      const querySnapshot = await getDocs(chefQuery)

      if (!querySnapshot.empty) {
        const chefDoc = querySnapshot.docs[0]
        chef.value = {
          id: chefDoc.id,
          ...chefDoc.data(),
        }
      } else {
        chef.value = null
      }
    } catch (err) {
      console.error('Error fetching current chef:', err)
      error.value = err.message
      chef.value = null
    } finally {
      loading.value = false
    }
  }

  // Get chef by ID
  const fetchChefById = async (chefId) => {
    loading.value = true
    error.value = null

    try {
      const chefRef = doc(db, 'chefs', chefId)
      const chefSnap = await getDoc(chefRef)

      if (chefSnap.exists()) {
        return {
          id: chefSnap.id,
          ...chefSnap.data(),
        }
      } else {
        throw new Error('Chef not found')
      }
    } catch (err) {
      console.error('Error fetching chef:', err)
      error.value = err.message
      return null
    } finally {
      loading.value = false
    }
  }

  // Get all chefs
  const fetchChefs = async () => {
    loading.value = true
    error.value = null

    try {
      const chefsQuery = query(
        collection(db, 'chefs'),
        where('deleted', '!=', true),
        orderBy('created_at', 'desc')
      )

      const querySnapshot = await getDocs(chefsQuery)
      chefs.value = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
    } catch (err) {
      console.error('Error fetching chefs:', err)
      error.value = err.message
      chefs.value = []
    } finally {
      loading.value = false
    }
  }

  // Subscribe to current chef changes
  const subscribeToCurrentChef = () => {
    return new Promise(async (resolve) => {
      try {
        const user = await waitForCurrentUser()
        if (!user) {
          resolve(null)
          return
        }

        const chefQuery = query(
          collection(db, 'chefs'),
          where('uid', '==', user.uid)
        )

        const unsubscribe = onSnapshot(chefQuery, (querySnapshot) => {
          if (!querySnapshot.empty) {
            const chefDoc = querySnapshot.docs[0]
            chef.value = {
              id: chefDoc.id,
              ...chefDoc.data(),
            }
          } else {
            chef.value = null
          }
        })

        resolve(unsubscribe)
      } catch (err) {
        console.error('Error subscribing to chef:', err)
        error.value = err.message
        resolve(null)
      }
    })
  }

  // Computed properties
  const hasChef = computed(() => !!chef.value)
  const isLoading = computed(
    () => loading.value || creating.value || updating.value || deleting.value
  )

  return {
    // State
    chef: readonly(chef),
    chefs: readonly(chefs),
    loading: readonly(loading),
    error: readonly(error),

    // Computed
    hasChef,
    isLoading,

    // Methods
    fetchCurrentChef,
    fetchChefById,
    fetchChefs,
    subscribeToCurrentChef,

    // Child composable methods
    createChef,
    updateChef,
    deleteChef,

    // Child composable state
    creating: readonly(creating),
    updating: readonly(updating),
    deleting: readonly(deleting),
  }
}
