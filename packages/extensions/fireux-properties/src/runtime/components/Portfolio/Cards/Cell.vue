<template>
  <NuxtLink
  v-if="link && to"
  :to="to"
  class="block w-full"
  :class="{ 'opacity-60 cursor-not-allowed': disabled }"
>
    <div
      class="fx-card--cell flex w-full items-start gap-3"
    >
      <UAvatar
        :alt="title"
        icon="i-lucide-briefcase-business"
        size="md"
        class="shrink-0"
      />

      <div class="min-w-0 flex-1 space-y-1">
        <div class="flex items-start justify-between gap-2">
          <div class="min-w-0">
            <div class="truncate text-sm font-semibold">{{ title }}</div>
            <div v-if="showSubtitle && subtitle" class="truncate text-xs text-dimmed">
              {{ subtitle }}
            </div>
          </div>

          <div v-if="showBadges && badgeItems.length" class="flex shrink-0 flex-wrap items-center gap-1">
            <UBadge
              v-for="badge in badgeItems"
              :key="badge"
              variant="soft"
              color="neutral"
              size="xs"
            >
              {{ badge }}
            </UBadge>
          </div>
        </div>

        <div v-if="showMeta" class="truncate text-xs text-dimmed">
          <span v-if="meta">{{ meta }}</span>
          <span v-else class="italic">missing</span>
        </div>
      </div>
    </div>
</NuxtLink>

<div
  v-else
  class="block w-full"
  :class="{ 'opacity-60 cursor-not-allowed': disabled }"
  @click="onClick"
>
    <div
      class="fx-card--cell flex w-full items-start gap-3"
    >
      <UAvatar
        :alt="title"
        icon="i-lucide-briefcase-business"
        size="md"
        class="shrink-0"
      />

      <div class="min-w-0 flex-1 space-y-1">
        <div class="flex items-start justify-between gap-2">
          <div class="min-w-0">
            <div class="truncate text-sm font-semibold">{{ title }}</div>
            <div v-if="showSubtitle && subtitle" class="truncate text-xs text-dimmed">
              {{ subtitle }}
            </div>
          </div>

          <div v-if="showBadges && badgeItems.length" class="flex shrink-0 flex-wrap items-center gap-1">
            <UBadge
              v-for="badge in badgeItems"
              :key="badge"
              variant="soft"
              color="neutral"
              size="xs"
            >
              {{ badge }}
            </UBadge>
          </div>
        </div>

        <div v-if="showMeta" class="truncate text-xs text-dimmed">
          <span v-if="meta">{{ meta }}</span>
          <span v-else class="italic">missing</span>
        </div>
      </div>
    </div>
</div>
</template>

<script setup lang="ts">
import { navigateTo } from '#imports'
import { computed } from 'vue'
import type { PortfolioCard } from '../../../composables/fireux/firestore/portfolio/utils/view/usePortfolioInterface'

type PortfolioCellProps = Pick<
  PortfolioCard.Card,
  'to' | 'title' | 'subtitle' | 'badges' | 'ownerLabel' | 'status' | 'regionLabel'
> & {
  showSubtitle?: boolean
  showMeta?: boolean
  showBadges?: boolean
  link?: boolean
  action?: boolean
  disabled?: boolean
}

const emit = defineEmits<{
  (event: 'action'): void
}>()

const props = withDefaults(defineProps<PortfolioCellProps>(), {
  badges: () => [],
  showSubtitle: true,
  showMeta: true,
  showBadges: true,
  link: false,
  action: false,
  disabled: false,
})

const badgeItems = computed(() => [...props.badges, props.status].filter(Boolean))
const meta = computed(() =>
  [props.ownerLabel, props.status ? `status ${props.status}` : ''].filter(Boolean).join(' · ')
)

const onClick = (event?: MouseEvent) => {
  if (props.disabled) return
  if (props.action) {
    emit('action')
    return
  }

  if (!props.link || !props.to) return
  if (event?.currentTarget instanceof HTMLAnchorElement) return

  navigateTo(props.to)
}
</script>
