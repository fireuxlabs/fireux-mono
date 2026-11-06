<template>
  <UCard>
    <div class="flex items-start gap-3">
      <span class="flex size-9 shrink-0 items-center justify-center">
        <UIcon
          :name="notification.read ? 'i-lucide-mail-open' : 'i-lucide-bell'"
          class="size-4"
          :class="notification.read ? '' : ''"
        />
      </span>
      <div class="min-w-0 flex-1 space-y-3">
        <div class="flex items-start justify-between gap-3">
          <p>{{ notification.message }}</p>
          <UBadge
            v-if="!notification.read"
            color="primary"
            variant="soft"
            size="xs"
            >New</UBadge
          >
        </div>
        <div class="flex flex-wrap items-center justify-between gap-2">
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
