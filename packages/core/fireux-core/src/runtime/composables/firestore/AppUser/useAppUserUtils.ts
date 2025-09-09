import { collection, query, where, getDocs } from 'firebase/firestore'
import { useFirestore } from 'vuefire'
import { useFireUXConfig } from '../../FireUXConfig'

export function useAppUserUtils() {
  function generateHandle(name: string): string {
    if (!name || typeof name !== 'string') {
      return randomUserId()
    }
    return name.trim().toLowerCase().replace(/\s+/g, '') || randomUserId()
  }

  function generateDisplayName(email?: string, displayName?: string): string {
    if (displayName?.trim()) return displayName
    if (email?.trim()) return email.split('@')[0] || randomUserId()
    return randomUserId()
  }

  function randomUserId(): string {
    return Math.random().toString(36).substring(2, 10)
  }

  async function generateSlug(user: {
    display_name?: string
    handle?: string
    email?: string
    uid: string
  }): Promise<string> {
    const { appId } = useFireUXConfig()

    // Priority: display_name -> handle -> email username -> fallback
    let baseName = ''

    if (
      user.display_name &&
      user.display_name !== user.email &&
      !user.display_name.includes('User-')
    ) {
      baseName = user.display_name
    } else if (user.handle && user.handle !== user.email) {
      baseName = user.handle
    } else if (user.email) {
      baseName = user.email.split('@')[0]
    } else {
      baseName = `user-${user.uid.slice(-8)}`
    }

    // Clean and format the base slug
    const cleanSlug = baseName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .replace(/^-+/, '') // Remove leading hyphens
      .replace(/-+$/, '') // Remove trailing hyphens
      .slice(0, 50) // Limit length

    // Check for uniqueness
    let finalSlug = cleanSlug
    let counter = 1

    while (await isSlugTaken(finalSlug, appId)) {
      finalSlug = `${cleanSlug}-${counter}`
      counter++
    }

    return finalSlug
  }

  async function isSlugTaken(slug: string, appId: string): Promise<boolean> {
    const db = useFirestore()
    const usersRef = collection(db, `apps/${appId}/users`)
    const q = query(usersRef, where('slug', '==', slug))
    const querySnapshot = await getDocs(q)
    return !querySnapshot.empty
  }

  return {
    generateHandle,
    generateDisplayName,
    randomUserId,
    generateSlug,
  }
}
