<template>
  <component
    :is="link && card.to ? 'NuxtLink' : 'div'"
    :to="link && card.to ? card.to : undefined"
    class="card card--cell"
    @click="onClick"
  >
    <div class="card__media">
      <UAvatar
        :src="card.imageUrl || undefined"
        :alt="card.title"
        size="md"
        icon="i-lucide-building-2"
      />

      <div class="card__content card__stack space-y-2">
        <div class="card__header flex items-start justify-between gap-3">
          <div class="min-w-0">
            <div class="card__title text-base font-semibold">{{ card.title }}</div>
            <div v-if="showSubtitle && card.subtitle" class="card__subtitle text-sm text-muted-foreground">
              {{ card.subtitle }}
            </div>
          </div>

          <UBadge :color="statusColor(card.status)" variant="soft">
            {{ card.status }}
          </UBadge>
        </div>

        <div v-if="showMeta" class="card__tagline text-xs text-muted-foreground">
          <span v-if="card.meta">{{ card.meta }}</span>
          <span v-else class="italic">missing</span>
        </div>
      </div>
    </div>
  </component>
</template>

<script setup lang="ts">
import type { ClientCard } from '../../../../composables/fireux/firestore/client/utils/view/useClientInterface'

type Props = {
  card: ClientCard.Card
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
