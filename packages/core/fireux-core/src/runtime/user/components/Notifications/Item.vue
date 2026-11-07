<template>
  <UCard>
    <div>
      <span>
        <UIcon
          :name="notification.read ? 'i-lucide-mail-open' : 'i-lucide-bell'"
        />
      </span>
      <div>
        <div>
          <p>{{ notification.message }}</p>
          <UBadge
            v-if="!notification.read"
            color="primary"
            variant="soft"
            size="xs"
            >New</UBadge
          >
        </div>
        <div>
          <time>{{ timestamp }}</time>
          <UButton
            v-if="!notification.read"
            label="Mark read"
            icon="i-lucide-check"
            color="neutral"
            variant="ghost"
            size="xs"
            :loading="busy"
            :disabled="disabled"
            @click="$emit('read')"
          />
        </div>
      </div>
    </div>
  </UCard>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import type { UserNotification } from '../../models/user-notification.model'
import { formatFirestoreTimestamp } from '../../../utils/firestore-timestamp'
const props = defineProps<{
  notification: UserNotification
  busy: boolean
  disabled: boolean
}>()
defineEmits<{ read: [] }>()
const timestamp = computed(
  () =>
    formatFirestoreTimestamp(props.notification.created?.at, {
      fallback: '',
    }) || ''
)
</script>
