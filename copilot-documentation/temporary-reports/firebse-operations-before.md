# Firestore Operations Snapshot (legacy `composables-old`)

## packages/core/fireux-core/src/runtime/composables-old/firestore/useFirestoreCreate.ts

```typescript
import {
  addDoc,
  collection,
  doc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { useFirestore, useCurrentUser } from 'vuefire'

type Stamped<T> = T & {
  created_at: ReturnType<typeof serverTimestamp>
  updated_at: ReturnType<typeof serverTimestamp>
  creator_id: string
}

export async function stampDoc<T>(
  data: T,
  opts?: { raw?: boolean }
): Promise<T | Stamped<T>> {
  if (opts?.raw) return data
  const user = useCurrentUser().value
  if (!user?.uid) throw new Error('User is not authenticated.')

  return {
    ...(data as any),
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
    creator_id: user.uid,
  }
}

export function useFirestoreCreate() {
  const db = useFirestore()

  async function createDocument<T>(
    path: string,
    data: T,
    opts?: { raw?: boolean }
  ): Promise<void> {
    const ref = collection(db, path)
    const stamped = await stampDoc(data, opts)
    await addDoc(ref, stamped as any)
  }

  async function setDocument<T>(
    path: string,
    id: string,
    data: T,
    opts?: { raw?: boolean }
  ): Promise<void> {
    const ref = doc(db, path, id)
    const stamped = await stampDoc(data, opts)
    await setDoc(ref, stamped as any)
  }

  return { createDocument, setDocument }
}
```

## packages/core/fireux-core/src/runtime/composables-old/firestore/operations/useFirestoreCreate.ts

```typescript
import {
  addDoc,
  collection,
  doc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { useFirestore, useCurrentUser } from 'vuefire'

type Stamped<T> = T & {
  created_at: ReturnType<typeof serverTimestamp>
  updated_at: ReturnType<typeof serverTimestamp>
  creator_id: string
}

export async function stampDoc<T>(
  data: T,
  opts?: { raw?: boolean }
): Promise<T | Stamped<T>> {
  if (opts?.raw) return data
  const user = useCurrentUser().value
  if (!user?.uid) throw new Error('User is not authenticated.')

  return {
    ...(data as any),
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
    creator_id: user.uid,
  }
}

export function useFirestoreCreate() {
  const db = useFirestore()

  async function createDocument<T>(
    path: string,
    data: T,
    opts?: { raw?: boolean }
  ): Promise<void> {
    const ref = collection(db, path)
    const stamped = await stampDoc(data, opts)
    await addDoc(ref, stamped as any)
  }

  async function setDocument<T>(
    path: string,
    id: string,
    data: T,
    opts?: { raw?: boolean }
  ): Promise<void> {
    const ref = doc(db, path, id)
    const stamped = await stampDoc(data, opts)
    await setDoc(ref, stamped as any)
  }

  return { createDocument, setDocument }
}
```

## packages/core/fireux-core/src/runtime/composables-old/firestore/useFirestoreRead.ts

```typescript
import { useCollection, useDocument, useFirestore } from 'vuefire'
import {
  collection,
  doc,
  query as fsq,
  orderBy,
  startAt,
  endAt,
  limit as fslimit,
  getDocs,
  type Query,
} from 'firebase/firestore'
import type { Ref } from 'vue'

/**
 * Unified Firestore read composable for FireUX.
 * Covers single docs, full collections, and common query patterns.
 */
export function useFirestoreRead() {
  const db = useFirestore()

  /** ───────────────────────────────
   * Fetch an entire collection (live reactive)
   * ─────────────────────────────── */
  function firestoreFetchCollection<T>(
    collectionPath: string
  ): Ref<T[] | undefined> {
    const q = fsq(collection(db, collectionPath)) as Query<T>
    return firestoreQuery<T>(q, collectionPath)
  }

  /** ───────────────────────────────
   * Fetch a single document (live reactive)
   * ─────────────────────────────── */
  function firestoreFetchDoc<T>(
    collectionPath: string,
    docId: string
  ): Ref<T | undefined> {
    const ref = doc(db, collectionPath, docId)
    const { data } = useDocument(ref, {
      ssrKey: `${collectionPath}-${docId}`,
    })
    return data as Ref<T | undefined>
  }

  /** ───────────────────────────────
   * Run any Firestore Query (live reactive)
   * Pass your own Query (with where, orderBy, etc.)
   * ─────────────────────────────── */
  function firestoreQuery<T>(
    q: Query<T>,
    ssrKey?: string
  ): Ref<T[] | undefined> {
    const { data } = useCollection<T>(q, ssrKey ? { ssrKey } : undefined)
    return data as Ref<T[] | undefined>
  }

  /** ───────────────────────────────
   * Convenience prefix search for “starts with” text fields
   * Requires field to be indexed and lowercased
   * ─────────────────────────────── */
  async function firestorePrefixSearch<T>(
    collectionPath: string,
    field: keyof T & string,
    value: string,
    max = 10
  ): Promise<T[]> {
    const q = fsq(
      collection(db, collectionPath),
      orderBy(field),
      startAt(value),
      endAt(value + '\uf8ff'),
      fslimit(max)
    )

    const snapshot = await getDocs(q)
    return snapshot.docs.map((docSnap) => docSnap.data() as T)
  }

  return {
    firestoreFetchCollection,
    firestoreFetchDoc,
    firestoreQuery,
    firestorePrefixSearch,
  }
}
```

## packages/core/fireux-core/src/runtime/composables-old/firestore/operations/useFirestoreRead.ts

```typescript
import { useCollection, useDocument, useFirestore } from 'vuefire'
import {
  collection,
  doc,
  query as fsq,
  orderBy,
  startAt,
  endAt,
  limit as fslimit,
  getDocs,
  type Query,
} from 'firebase/firestore'
import type { Ref } from 'vue'

/**
 * Unified Firestore read composable for FireUX.
 * Covers single docs, full collections, and common query patterns.
 */
export function useFirestoreRead() {
  const db = useFirestore()

  /** ───────────────────────────────
   * Fetch an entire collection (live reactive)
   * ─────────────────────────────── */
  function firestoreFetchCollection<T>(
    collectionPath: string
  ): Ref<T[] | undefined> {
    const q = fsq(collection(db, collectionPath)) as Query<T>
    return firestoreQuery<T>(q, collectionPath)
  }

  /** ───────────────────────────────
   * Fetch a single document (live reactive)
   * ─────────────────────────────── */
  function firestoreFetchDoc<T>(
    collectionPath: string,
    docId: string
  ): Ref<T | undefined> {
    const ref = doc(db, collectionPath, docId)
    const { data } = useDocument(ref, {
      ssrKey: `${collectionPath}-${docId}`,
    })
    return data as Ref<T | undefined>
  }

  /** ───────────────────────────────
   * Run any Firestore Query (live reactive)
   * Pass your own Query (with where, orderBy, etc.)
   * ─────────────────────────────── */
  function firestoreQuery<T>(
    q: Query<T>,
    ssrKey?: string
  ): Ref<T[] | undefined> {
    const { data } = useCollection<T>(q, ssrKey ? { ssrKey } : undefined)
    return data as Ref<T[] | undefined>
  }

  /** ───────────────────────────────
   * Convenience prefix search for “starts with” text fields
   * Requires field to be indexed and lowercased
   * ─────────────────────────────── */
  async function firestorePrefixSearch<T>(
    collectionPath: string,
    field: keyof T & string,
    value: string,
    max = 10
  ): Promise<T[]> {
    const q = fsq(
      collection(db, collectionPath),
      orderBy(field),
      startAt(value),
      endAt(value + '\uf8ff'),
      fslimit(max)
    )

    const snapshot = await getDocs(q)
    return snapshot.docs.map((docSnap) => docSnap.data() as T)
  }

  return {
    firestoreFetchCollection,
    firestoreFetchDoc,
    firestoreQuery,
    firestorePrefixSearch,
  }
}
```

## packages/core/fireux-core/src/runtime/composables-old/firestore/useFirestoreUpdate.ts

```typescript
// ~/composables/firestore/operations/useFirestoreUpdate.ts
import { updateDoc, doc, serverTimestamp } from 'firebase/firestore'
import { useFirestore } from 'vuefire'
import { useRequireUser } from '../firebase/useRequireUser'

export function useFirestoreUpdate() {
  const db = useFirestore()

  async function updateDocument<T>(
    collection: string,
    id: string,
    data: Partial<T>
  ): Promise<void> {
    await useRequireUser()
    const ref = doc(db, collection, id)
    await updateDoc(ref, { ...data, updated_at: serverTimestamp() })
  }

  return { updateDocument }
}
```

## packages/core/fireux-core/src/runtime/composables-old/firestore/operations/useFirestoreUpdate.ts

```typescript
import { updateDoc, doc, serverTimestamp } from 'firebase/firestore'
import { useFirestore } from 'vuefire'
import { useRequireUser } from '../../firebase/useRequireUser'

export function useFirestoreUpdate() {
  const db = useFirestore()

  async function updateDocument<T>(
    collection: string,
    id: string,
    data: Partial<T>
  ): Promise<void> {
    await useRequireUser()
    const ref = doc(db, collection, id)
    await updateDoc(ref, { ...data, updated_at: serverTimestamp() })
  }

  return { updateDocument }
}
```

## packages/core/fireux-core/src/runtime/composables-old/firestore/useFirestoreDelete.ts

```typescript
import { deleteDoc, doc } from 'firebase/firestore'
import { useFirestore } from 'vuefire'
import { useFireUXConfig } from '../FireUXConfig'
import { useRequireUser } from '../firebase/useRequireUser'

export function useFirestoreDelete() {
  const db = useFirestore()
  useFireUXConfig()

  async function deleteDocument(
    name: string,
    id: string,
    _opts?: { appScoped?: boolean }
  ): Promise<void> {
    await useRequireUser()
    const ref = doc(db, name, id)
    // Optionally: fetch doc and check appId if appScoped (for extra safety)
    // For now, just delete by ID
    await deleteDoc(ref)
  }

  return { deleteDocument }
}
```

## packages/core/fireux-core/src/runtime/composables-old/firestore/operations/useFirestoreDelete.ts

```typescript
import { deleteDoc, doc } from 'firebase/firestore'
import { useFirestore } from 'vuefire'
import { useFireUXConfig } from '../../FireUXConfig'
import { useRequireUser } from '../../firebase/useRequireUser'

export function useFirestoreDelete() {
  const db = useFirestore()
  useFireUXConfig()

  async function deleteDocument(
    name: string,
    id: string,
    _opts?: { appScoped?: boolean }
  ): Promise<void> {
    await useRequireUser()
    const ref = doc(db, name, id)
    await deleteDoc(ref)
  }

  return { deleteDocument }
}
```

## packages/core/fireux-core/src/runtime/composables-old/firestore/useFirestoreSearch.ts

```typescript
import { useFirestoreRead } from './useFirestoreRead'

export interface FirestorePrefixSearchOptions<T> {
  collection: string
  field: keyof T & string
  query: string
  limit?: number
  ssrKey?: string
}

export function useFirestoreSearch() {
  const { firestorePrefixSearch } = useFirestoreRead()

  async function prefixSearch<T>(
    options: FirestorePrefixSearchOptions<T>
  ): Promise<T[]> {
    const { collection, field, query, limit = 10 } = options

    return firestorePrefixSearch<T>(collection, field, query, limit)
  }

  return { prefixSearch }
}
```

## packages/core/fireux-core/src/runtime/composables-old/firestore/operations/useFirestoreSearch.ts

```typescript
import { useFirestoreRead } from './useFirestoreRead'

export interface FirestorePrefixSearchOptions<T> {
  collection: string
  field: keyof T & string
  query: string
  limit?: number
  ssrKey?: string
}

export function useFirestoreSearch() {
  const { firestorePrefixSearch } = useFirestoreRead()

  async function prefixSearch<T>(
    options: FirestorePrefixSearchOptions<T>
  ): Promise<T[]> {
    const { collection, field, query, limit = 10 } = options

    return firestorePrefixSearch<T>(collection, field, query, limit)
  }

  return { prefixSearch }
}
```

## packages/core/fireux-core/src/runtime/composables-old/firestore/useFirestoreManager.ts

```typescript
// ~/composables/useFirestoreManager.ts

import { useFirestoreRead } from './useFirestoreRead'
import { useFirestoreCreate } from './useFirestoreCreate'
import { useFirestoreUpdate } from './useFirestoreUpdate'
import { useFirestoreDelete } from './useFirestoreDelete'
import { useFirestoreUtils } from './useFirestoreUtils'

export function useFirestoreManager() {
  const firestoreUtils = useFirestoreUtils()

  // Lazy wrapper functions to avoid calling composables at top level
  function firestoreFetchCollection<T>(collectionPath: string) {
    const { firestoreFetchCollection } = useFirestoreRead()
    return firestoreFetchCollection<T>(collectionPath)
  }

  function firestoreFetchDoc<T>(collectionPath: string, docId: string) {
    const { firestoreFetchDoc } = useFirestoreRead()
    return firestoreFetchDoc<T>(collectionPath, docId)
  }

  function setDocument<T>(
    collectionName: string,
    docId: string,
    data: T,
    options?: any
  ) {
    const { setDocument } = useFirestoreCreate()
    return setDocument<T>(collectionName, docId, data, options)
  }

  function updateDocument<T extends { updated_at?: unknown }>(
    collectionName: string,
    docId: string,
    data: Partial<T>
  ) {
    const { updateDocument } = useFirestoreUpdate()
    return updateDocument<T>(collectionName, docId, data)
  }

  function deleteDocument(
    collectionName: string,
    docId: string,
    options?: any
  ) {
    const { deleteDocument } = useFirestoreDelete()
    return deleteDocument(collectionName, docId, options)
  }

  return {
    firestoreFetchCollection,
    firestoreFetchDoc,
    setDocument,
    updateDocument,
    deleteDocument,
    ...firestoreUtils,
  }
}
```

## packages/core/fireux-core/src/runtime/composables-old/firestore/operations/useFirestoreManager.ts

```typescript
import { useFirestoreRead } from './useFirestoreRead'
import { useFirestoreCreate } from './useFirestoreCreate'
import { useFirestoreUpdate } from './useFirestoreUpdate'
import { useFirestoreDelete } from './useFirestoreDelete'
import { useFirestoreUtils } from '../utils/useFirestoreUtils'

export function useFirestoreManager() {
  const firestoreUtils = useFirestoreUtils()

  function firestoreFetchCollection<T>(collectionPath: string) {
    const { firestoreFetchCollection } = useFirestoreRead()
    return firestoreFetchCollection<T>(collectionPath)
  }

  function firestoreFetchDoc<T>(collectionPath: string, docId: string) {
    const { firestoreFetchDoc } = useFirestoreRead()
    return firestoreFetchDoc<T>(collectionPath, docId)
  }

  function setDocument<T>(
    collectionPath: string,
    docId: string,
    data: T,
    options?: any
  ) {
    const { setDocument } = useFirestoreCreate()
    return setDocument<T>(collectionPath, docId, data, options)
  }

  function updateDocument<T extends { updated_at?: unknown }>(
    collectionPath: string,
    docId: string,
    data: Partial<T>
  ) {
    const { updateDocument } = useFirestoreUpdate()
    return updateDocument<T>(collectionPath, docId, data)
  }

  function deleteDocument(collectionPath: string, docId: string) {
    const { deleteDocument } = useFirestoreDelete()
    return deleteDocument(collectionPath, docId)
  }

  return {
    firestoreFetchCollection,
    firestoreFetchDoc,
    setDocument,
    updateDocument,
    deleteDocument,
    ...firestoreUtils,
  }
}
```

## packages/core/fireux-core/src/runtime/composables-old/firestore/useFirestoreUtils.ts

```typescript
// ~/composables/firestore/useFirestoreUtils.ts
import { useFirestore } from 'vuefire'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { useFireUXConfig } from '../FireUXConfig'

export function useFirestoreUtils() {
  /**
   * Checks whether a given field/value pair is unique in a collection,
   * optionally scoped to the current app.
   */
  const checkUnique = async (
    collectionName: string,
    field: string,
    value: string,
    appScoped = true
  ): Promise<boolean> => {
    const db = useFirestore()
    const { appId } = useFireUXConfig()
    // Build base constraint
    const constraints = [where(field, '==', value)]
    // If app scoping is on, grab appId from runtime config
    if (appScoped) {
      constraints.push(where('appId', '==', appId))
    }
    // Query and return whether any docs matched
    const q = query(collection(db, collectionName), ...constraints)
    const snapshot = await getDocs(q)
    return snapshot.empty
  }

  const getCollectionPath = (name: string): string => {
    const { appId } = useFireUXConfig()
    return `${appId}/${name}`
  }

  const fetchDocumentsByField = async <T>(
    collectionName: string,
    field: string,
    value: unknown,
    appScoped = true
  ): Promise<T[]> => {
    const db = useFirestore()
    const { appId } = useFireUXConfig()
    const constraints = [where(field, '==', value)]
    if (appScoped) {
      constraints.push(where('appId', '==', appId))
    }
    const q = query(collection(db, collectionName), ...constraints)
    const snapshot = await getDocs(q)
    return snapshot.docs.map((doc) => doc.data() as T)
  }

  /**
   * Fetches a single document by a specific field and value.
   */
  const firestoreQueryOneByField = async <T>(
    collectionName: string,
    field: string,
    value: string,
    appScoped = true
  ): Promise<T | null> => {
    const db = useFirestore()
    const { appId } = useFireUXConfig()
    const constraints = [where(field, '==', value)]
    if (appScoped) {
      constraints.push(where('appId', '==', appId))
    }
    const q = query(collection(db, collectionName), ...constraints)
    const snapshot = await getDocs(q)
    if (snapshot.empty || !snapshot.docs[0]) return null
    return snapshot.docs[0].data() as T
  }

  /**
   * Fetches a subcollection of documents for a given parent document.
   */
  const firestoreFetchSubcollection = async <T>(
    parentCollection: string,
    parentId: string,
    subcollectionName: string
  ): Promise<T[]> => {
    const db = useFirestore()
    const subcollectionRef = collection(
      db,
      `${parentCollection}/${parentId}/${subcollectionName}`
    )
    const snapshot = await getDocs(subcollectionRef)
    return snapshot.docs.map((doc) => doc.data() as T)
  }

  return {
    checkUnique,
    getCollectionPath,
    fetchDocumentsByField,
    firestoreQueryOneByField,
    firestoreFetchSubcollection,
  }
}
```
