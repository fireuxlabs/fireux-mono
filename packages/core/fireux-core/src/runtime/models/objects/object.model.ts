// ~/models/objects/object.model.ts

import type { ComputedRef, Ref } from 'vue'

/**
 * Base interface that all Firestore objects should extend
 * Provides common fields for tracking, identification, and app scoping
 */
export interface FirestoreObject {
  /** Unique slug/identifier for the object */
  slug: string
  /** App ID for multi-tenancy */
  appId: string
  /** Creation timestamp */
  created_at: string | Date
  /** Last update timestamp */
  updated_at: string | Date
  /** ID of the user who created this object */
  creator_id: string
}

/**
 * Configuration for object-specific CRUD operations
 * Allows each object type to provide its own create, update, and delete logic while
 * sharing common CRUD patterns
 */
export interface ObjectConfig {
  /** Collection name in Firestore */
  collectionName: string
  /** Object type name for dynamic function naming */
  objectType?: string
  /** When true, treats the object as user-scoped and exposes `current` bound to currentUser.uid (parity with useProfile) */
  userScoped?: boolean
  /** Optional create composable for object-specific logic */
  createComposable?: () => {
    [key: string]: any
  }
  /** Optional update composable for object-specific logic */
  updateComposable?: () => {
    [key: string]: any
  }
  /** Optional delete composable for object-specific logic */
  deleteComposable?: () => {
    [key: string]: any
  }
}

/**
 * Input type for creating new objects
 * Excludes system-generated fields
 */
export type ObjectInput<T extends FirestoreObject> = Omit<
  T,
  'created_at' | 'updated_at' | 'appId'
>

/**
 * Input type for updating objects
 * Excludes system-generated and immutable fields
 */
export type ObjectUpdate<T extends FirestoreObject> = Partial<
  Omit<T, 'slug' | 'created_at' | 'updated_at' | 'appId' | 'creator_id'>
>

/**
 * Core CRUD operations interface
 */
export interface ObjectCRUD<T extends FirestoreObject> {
  // Current object (by current user's ID or current slug)
  currentObject: ComputedRef<T | null | undefined>

  // Collection of all objects
  objectsCollection: Ref<T[] | undefined>

  // Fetch by ID/slug
  fetchObject: (id: string) => Promise<Ref<T | null | undefined>>

  // Create new object
  createObject: (data: ObjectInput<T>) => Promise<boolean>

  // Delete object
  deleteObject: (id: string) => Promise<boolean>

  // Update object (if update composable provided)
  updateObject?: (id: string, updates: ObjectUpdate<T>) => Promise<boolean>
}
