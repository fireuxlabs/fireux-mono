<template>
  <component
    :is="link && record.to ? 'NuxtLink' : 'div'"
    :to="link && record.to ? record.to : undefined"
    class="block w-full"
    @click="onClick"
  >
    <div
      class="flex w-full items-start gap-3 rounded-lg border border-gray-200/60 bg-white/70 p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-gray-800/60 dark:bg-gray-900/40"
    >
      <UAvatar :src="record.imageUrl || undefined" :alt="record.title" size="md" class="shrink-0" />

      <div class="min-w-0 flex-1 space-y-1">
        <div class="flex items-start justify-between gap-2">
          <div class="min-w-0">
            <div class="truncate text-sm font-semibold">{{ record.title }}</div>
            <div v-if="showSubtitle && record.subtitle" class="truncate text-xs text-dimmed">
              {{ record.subtitle }}
            </div>
          </div>

          <div v-if="showBadges && record.badges?.length" class="flex shrink-0 flex-wrap items-center gap-1">
            <UBadge
              v-for="badge in record.badges"
              :key="badge"
              variant="soft"
              color="neutral"
              size="xs"
            >
              {{ badge }}
            </UBadge>
          </div>
        </div>

        <div v-if="showMeta && metaText" class="truncate text-xs text-dimmed">
          {{ metaText }}
        </div>

        <div v-if="showTagline" class="truncate text-xs text-dimmed">
          <span v-if="prop">{{ prop }}</span>
          <span v-else class="italic">missing</span>
        </div>
      </div>
    </div>
  </component>
</template>

<script setup lang="ts">
import { navigateTo } from '#imports'
import { computed } from 'vue'
import type { ProductCard } from '../../../../composables/fireux/firestore/product/utils/view/useProductInterface'

type Props = Partial<ProductCard.Card> & {
  card?: ProductCard.Card
  prop?: string
  showSubtitle?: boolean
  showBadges?: boolean
  showMeta?: boolean
  showTagline?: boolean
  link?: boolean
  action?: boolean
}

const emit = defineEmits<{
  (event: 'action'): void
}>()

const props = withDefaults(defineProps<Props>(), {
  prop: '',
  showSubtitle: true,
  showBadges: true,
  showMeta: true,
  showTagline: true,
  link: false,
  action: false,
})

const record = computed(() => props.card ?? props)
const metaText = computed(() => {
  const description = String(record.value.description || '').trim()
  const subtitle = String(record.value.subtitle || '').trim()
  if (!description) return ''
  return description === subtitle ? '' : description
})

const onClick = (event?: MouseEvent) => {
  if (props.action) {
    emit('action')
    return
  }

  if (!props.link || !props.to) return
  if (event?.currentTarget instanceof HTMLAnchorElement) return

  navigateTo(props.to)
}
</script>
