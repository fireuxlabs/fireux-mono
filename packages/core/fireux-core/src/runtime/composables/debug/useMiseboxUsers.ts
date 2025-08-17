import { ref } from 'vue'
import { collection, getDocs } from 'firebase/firestore'
import { useFirestore } from 'vuefire'
import type { AppUser } from '../../models/core/appUser.model'

/**
 * Debug composable to fetch all misebox app users for inspection
 */
export function useMiseboxUsers() {
  const db = useFirestore()
  const users = ref<AppUser[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchMiseboxUsers = async () => {
    loading.value = true
    error.value = null

    try {
      console.log('🔍 Fetching all misebox app users...')

      // Fetch all documents from apps/misebox/users collection
      const usersCollection = collection(db, 'apps/misebox/users')
      const querySnapshot = await getDocs(usersCollection)

      const fetchedUsers: AppUser[] = []
      querySnapshot.forEach((doc) => {
        const userData = doc.data() as AppUser
        fetchedUsers.push({
          ...userData,
          uid: doc.id, // Ensure uid matches document ID
        })
      })

      users.value = fetchedUsers
      console.log(
        `✅ Found ${fetchedUsers.length} misebox users:`,
        fetchedUsers
      )

      // Log each user for detailed inspection
      fetchedUsers.forEach((user, index) => {
        console.log(`👤 User ${index + 1}:`, {
          uid: user.uid,
          role: user.role,
          display_name: user.display_name,
          avatar: user.avatar?.substring(0, 50) + '...' || 'No avatar',
          created_at: user.created_at,
          first_name: user.first_name,
          last_name: user.last_name,
          // Show all fields for inspection
          ...user,
        })
      })
    } catch (err) {
      console.error('❌ Error fetching misebox users:', err)
      error.value = err instanceof Error ? err.message : 'Unknown error'
    } finally {
      loading.value = false
    }
  }

  return {
    users,
    loading,
    error,
    fetchMiseboxUsers,
  }
}
