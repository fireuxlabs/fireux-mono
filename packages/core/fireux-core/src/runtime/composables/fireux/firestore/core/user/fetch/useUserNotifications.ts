// Concurrent edit — 2026-07-20 15:20 CEST — Customer order notification pass: bind one owner-scoped live notification read.
// Concurrent edit — 2026-07-21 15:25 CEST — Dashboard SSR repair: bind owner notifications only after browser auth is available.
import {
  collection,
  limit,
  orderBy,
  query,
  type Query,
} from 'firebase/firestore'
import { computed, onMounted, ref } from 'vue'
import { UserStorage } from '../../../../../../models/core/user.model'
import {
  type UserNotification,
  UserNotificationStorage,
} from '../../../../../../models/operations/user-notification.model'
import { useAuth } from '../../../../firebase/useAuth'
import { useFirestoreRead } from '../../../operations/useFirestoreRead'
import {
  readRuntimeFirestoreDatabaseId,
  useFirestore,
} from '../../../vuefire'

export type UserNotificationRecord = UserNotification & { id: string }

const MAX_VISIBLE_NOTIFICATIONS = 50

export function useUserNotifications() {
  if (import.meta.server) {
    return {
      notifications: ref<UserNotificationRecord[]>([]),
      unreadCount: ref(0),
      pending: ref(false),
      error: ref<unknown>(null),
      outcome: ref<'idle'>('idle'),
    }
  }

  const { currentUser } = useAuth()
  const appDatabaseId = readRuntimeFirestoreDatabaseId()
  const appDb = useFirestore(appDatabaseId)
  const clientReady = ref(false)
  onMounted(() => {
    clientReady.value = true
  })
  const ownerUid = computed(() => {
    if (!clientReady.value) return ''
    const user = currentUser.value
    return user && !user.isAnonymous ? user.uid : ''
  })
  const collectionPath = computed(() => {
    const uid = ownerUid.value
    return uid
      ? `${UserStorage.collection}/${uid}/${UserNotificationStorage.collection}`
      : ''
  })
  const notificationQuery = computed<Query<UserNotificationRecord> | null>(() => {
    const path = collectionPath.value
    if (!path) return null

    return query(
      collection(appDb, path),
      orderBy('created.at', 'desc'),
      limit(MAX_VISIBLE_NOTIFICATIONS)
    ) as Query<UserNotificationRecord>
  })
  const { firestoreQuery } = useFirestoreRead({
    databaseId: appDatabaseId,
  })
  const source = firestoreQuery<UserNotificationRecord>(
    notificationQuery,
    undefined,
    collectionPath
  )
  const notifications = computed(() => source.data.value ?? [])
  const unreadCount = computed(() =>
    notifications.value.reduce(
      (count, notification) => count + (notification.read ? 0 : 1),
      0
    )
  )

  return {
    notifications,
    unreadCount,
    pending: source.pending,
    error: source.error,
    outcome: source.outcome,
  }
}
