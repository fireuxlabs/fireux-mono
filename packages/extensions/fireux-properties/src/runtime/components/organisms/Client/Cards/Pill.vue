<template>
  <component
    :is="link && to ? 'NuxtLink' : 'div'"
    :to="link && to ? to : undefined"
    class="pill"
    @click="onClick"
  >
    <div class="flex min-w-0 items-start gap-2">
      <UAvatar
        :src="imageUrl || undefined"
        :alt="title || ''"
        size="sm"
        icon="i-lucide-building-2"
      />

      <div class="min-w-0 flex-1 space-y-1">
        <div class="flex items-center gap-2">
          <p class="truncate text-sm font-medium text-highlighted">
            {{ title }}
          </p>
          <UBadge v-if="status" size="xs" variant="soft" :color="statusColor(status)">
            {{ status }}
          </UBadge>
        </div>
        <p v-if="showSubtitle && subtitle" class="truncate text-xs text-toned">
          {{ subtitle }}
        </p>
        <p v-if="showMeta && meta" class="truncate text-xs text-dimmed">
          {{ meta }}
        </p>
      </div>
    </div>
  </component>
</template>

<script setup lang="ts">
import type { ClientCard } from '../../../../composables/fireux/firestore/client/utils/view/useClientInterface'

type PillProps = Pick<ClientCard.Card, 'to' | 'imageUrl' | 'title' | 'subtitle' | 'meta' | 'status'> & {
  showSubtitle?: boolean
  showMeta?: boolean
  link?: boolean
  action?: boolean
}

const emit = defineEmits<{
  (event: 'action'): void
}>()

const props = withDefaults(defineProps<PillProps>(), {
  showSubtitle: true,
  showMeta: true,
  link: false,
  action: false,
})

const onClick = () => {
  if (props.action) emit('action')
}

const statusColor = (status: string) => {
  if (status === 'arrears') return 'error'
  if (status === 'ending') return 'warning'
  if (status === 'active') return 'success'
  return 'neutral'
}
</script>
