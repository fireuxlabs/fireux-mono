<script setup lang="ts">
import { computed } from '#imports'
import { formatTimeAgo } from '@vueuse/core'
import { collection, orderBy, query } from 'firebase/firestore'
import { useCollection, useFirestore } from 'vuefire'
import { useAuth } from '../../../composables/fireux/firebase/useAuth'
import type { UserNotification } from '../../../models/core/user.model'

// Use v-model:open from parent instead of a global console store
const open = defineModel<boolean>('open', { default: false })

const db = useFirestore()
const { uid } = useAuth()

const notificationsQuery = computed(() => {
  if (!uid.value) return null
  const ref = collection(db, 'users', uid.value, 'notifications')
  return query(ref, orderBy('created_at', 'desc'))
})

const { data: notifications } = useCollection<UserNotification>(
  notificationsQuery as any
)
</script>

<template>
  <USlideover v-model:open="open" title="Notifications">
    <template #body>
      <div
        v-for="notification in notifications"
        :key="`${notification.created_at}:${notification.scope}:${notification.message}`"
        class="px-3 py-2.5 rounded-md hover:bg-elevated/50 flex items-center gap-3 relative -mx-3 first:-mt-3 last:-mb-3"
      >
        <UChip color="error" :show="!notification.read" inset />

        <div class="text-sm flex-1">
          <p class="flex items-center justify-between">
            <span class="text-highlighted font-medium">
              {{ notification.scope === 'app' ? 'App' : 'Ecosystem' }}
            </span>

            <time
              :datetime="notification.created_at"
              class="text-muted text-xs"
              v-text="formatTimeAgo(new Date(notification.created_at))"
            />
          </p>

          <p class="text-dimmed">
            {{ notification.message }}
          </p>
        </div>
      </div>
    </template>
  </USlideover>
</template>
