<template>
  <component
    :is="isLinkComponent ? 'NuxtLink' : 'button'"
    v-bind="rootProps"
    class="pill"
    :class="{ 'opacity-60 cursor-not-allowed': disabled }"
    @click="!isLinkComponent && onClick($event)"
  >
    <div class="flex min-w-0 items-start gap-2">
      <UAvatar
        v-if="imageUrl"
        :src="imageUrl || undefined"
        :alt="title || ''"
        size="sm"
      />

      <div class="min-w-0 flex-1 space-y-1">
        <p class="truncate text-sm font-medium text-highlighted">
          {{ title }}
        </p>
        <p v-if="showSubtitle && subtitle" class="truncate text-xs text-toned">
          {{ subtitle }}
        </p>
        <div v-if="showBadges && badgeItems.length" class="flex flex-wrap items-center gap-1">
          <UBadge v-for="badge in badgeItems" :key="badge" variant="soft" color="neutral" size="xs">
            {{ badge }}
          </UBadge>
        </div>
      </div>
    </div>
  </component>
</template>

<script setup lang="ts">
import { navigateTo } from '#imports'
import { computed } from 'vue'
import type { PortfolioCard } from '../../../composables/fireux/firestore/portfolio/utils/view/usePortfolioInterface'

type PillProps = Pick<PortfolioCard.Card, 'to' | 'title' | 'subtitle'> & {
  badges?: PortfolioCard.Card['badges']
  status?: PortfolioCard.Card['status']
  imageUrl?: string
  showSubtitle?: boolean
  showBadges?: boolean
  link?: boolean
  action?: boolean
  disabled?: boolean
}

const emit = defineEmits<{
  (event: 'action'): void
}>()

const props = withDefaults(defineProps<PillProps>(), {
  badges: () => [],
  showSubtitle: true,
  showBadges: true,
  link: false,
  action: false,
  disabled: false,
})

const isLinkComponent = computed(() => Boolean(props.link && props.to))
const badgeItems = computed(() => [...(props.badges ?? []), props.status].filter(Boolean))
const rootProps = computed(() =>
  isLinkComponent.value
    ? { to: props.to }
    : { type: 'button' as const }
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
