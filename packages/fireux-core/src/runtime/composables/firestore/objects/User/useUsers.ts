import { collection, getDocs, query, orderBy } from 'firebase/firestore'
import { useFirestore } from 'vuefire'
import { useFireUXConfig } from '../../../FireUXConfig'
import { ref } from 'vue'
import type { AppUser } from '../../../models/appUser.model'

export async function useUsers() {
  const db = useFirestore()
  const { appId } = useFireUXConfig()

  const users = ref<AppUser[]>([])

  try {
    if (!appId) {
      throw new Error('App ID not configured')
    }

    const usersCollection = collection(db, `apps/${appId}/users`)
    const usersQuery = query(usersCollection, orderBy('created_at', 'desc'))
    const snapshot = await getDocs(usersQuery)

    users.value = snapshot.docs.map((doc) => ({
      uid: doc.id,
      ...doc.data(),
    })) as AppUser[]
  } catch (error) {
    console.error('Failed to fetch users:', error)
    users.value = []
  }

  return {
    users,
  }
}
