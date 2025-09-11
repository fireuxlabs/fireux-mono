/**
 * Tenant-scoped AppUser model.
 * ⚠️ Not used by king apps (e.g. Misebox), only by tenant apps (e.g. Niederhorn).
 */
import type { FirebaseTimestamp } from '../../types/firebase'

export interface AppUser {
  id: string                 // Firestore doc id (often == uid)
  uid: string                // Firebase Auth UID
  email: string
  display_name: string
  avatar?: string
  handle?: string
  role?: 'user' | 'admin'
  created_at: string | Date | FirebaseTimestamp
  updated_at?: string | Date | FirebaseTimestamp
}

// Minimal author projection (used in content contexts)
export interface Author {
  id: string
  display_name: string
  handle?: string
  avatar?: string
  slug?: string
}

