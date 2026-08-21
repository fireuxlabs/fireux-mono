<template>
  <component
    :is="link && record.to ? 'NuxtLink' : 'div'"
    :to="link && record.to ? record.to : undefined"
    class="block w-full"
    @click="onClick"
  >
    <div class="fx-card--cell">
      <UAvatar
        :src="record.imageUrl || undefined"
        :alt="record.title"
        size="md"
        icon="i-lucide-building-2"
        class="shrink-0"
      />

      <div class="min-w-0 flex-1 space-y-1">
        <div class="flex items-start justify-between gap-2">
          <div class="min-w-0">
            <div class="truncate text-sm font-semibold">{{ record.title }}</div>
            <div
              v-if="showSubtitle && record.subtitle"
              class="truncate text-xs text-dimmed"
            >
              {{ record.subtitle }}
            </div>
          </div>

          <UBadge
            :color="statusColor(record.status || '')"
            variant="soft"
            size="xs"
            class="shrink-0"
          >
            {{ record.status }}
          </UBadge>
        </div>

        <div v-if="showMeta" class="truncate text-xs text-dimmed">
          <span v-if="record.meta">{{ record.meta }}</span>
          <span v-else class="italic">missing</span>
        </div>
      </div>
    </div>
  </component>
</template>

<script setup lang="ts">
import { navigateTo } from '#imports'
import { computed } from 'vue'
import type { ClientCard } from '../../../../../composables/workspace/operations/Clients/utils/view/useClientInterface'

type Props = Partial<ClientCard.Card> & {
  card?: ClientCard.Card
  showSubtitle?: boolean
  showMeta?: boolean
  link?: boolean
  action?: boolean
}

const emit = defineEmits<{
  (event: 'action'): void
}>()

const props = withDefaults(defineProps<Props>(), {
  showSubtitle: true,
  showMeta: true,
  link: false,
  action: false,
})

const record = computed(() => props.card ?? props)

const onClick = (event?: MouseEvent) => {
  if (props.action) {
    emit('action')
    return
  }

  if (!props.link || !props.to) return
  if (event?.currentTarget instanceof HTMLAnchorElement) return

  navigateTo(props.to)
}

const statusColor = (status: string) => {
  if (status === 'arrears') return 'error'
  if (status === 'ending') return 'warning'
  if (status === 'active') return 'success'
  return 'neutral'
}
</script>
