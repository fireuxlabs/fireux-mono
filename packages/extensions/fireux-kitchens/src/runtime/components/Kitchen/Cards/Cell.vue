<template>
  <NuxtLink
  v-if="link && to"
  :to="to"
  class="block w-full"
>
    <div
      class="flex w-full items-center gap-3 rounded-lg border border-gray-200/60 bg-white/70 p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-gray-800/60 dark:bg-gray-900/40"
    >
      <UAvatar
        :src="resolvedImageUrl || undefined"
        :alt="name"
        size="md"
        icon="i-lucide-image"
        :class="avatarShadeClass"
      />

      <div class="min-w-0 flex-1 space-y-1">
        <div class="flex items-start justify-between gap-2">
          <div class="min-w-0">
            <div class="truncate text-sm font-semibold">{{ name }}</div>

            <div v-if="showSubtitle && resolvedAddress" class="flex items-center gap-1 truncate text-xs text-dimmed">
              <UIcon name="i-lucide-map-pin" class="h-3 w-3" />
              <span class="truncate">{{ resolvedAddress }}</span>
            </div>
          </div>

          <UBadge
            v-if="showSource && sourceLabel"
            variant="soft"
            color="neutral"
            size="xs"
            class="shrink-0"
          >
            {{ sourceLabel }}
          </UBadge>
          <UBadge
            v-for="badge in visibleBadges"
            :key="badge"
            variant="soft"
            color="neutral"
            size="xs"
            class="shrink-0"
          >
            {{ badge }}
          </UBadge>
        </div>

        <div v-if="showTagline" class="truncate text-xs text-dimmed">
          <span v-if="prop">{{ prop }}</span>
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
      class="flex w-full items-center gap-3 rounded-lg border border-gray-200/60 bg-white/70 p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-gray-800/60 dark:bg-gray-900/40"
    >
      <UAvatar
        :src="resolvedImageUrl || undefined"
        :alt="name"
        size="md"
        icon="i-lucide-image"
        :class="avatarShadeClass"
      />

      <div class="min-w-0 flex-1 space-y-1">
        <div class="flex items-start justify-between gap-2">
          <div class="min-w-0">
            <div class="truncate text-sm font-semibold">{{ name }}</div>

            <div v-if="showSubtitle && resolvedAddress" class="flex items-center gap-1 truncate text-xs text-dimmed">
              <UIcon name="i-lucide-map-pin" class="h-3 w-3" />
              <span class="truncate">{{ resolvedAddress }}</span>
            </div>
          </div>

          <UBadge
            v-if="showSource && sourceLabel"
            variant="soft"
            color="neutral"
            size="xs"
            class="shrink-0"
          >
            {{ sourceLabel }}
          </UBadge>
          <UBadge
            v-for="badge in visibleBadges"
            :key="badge"
            variant="soft"
            color="neutral"
            size="xs"
            class="shrink-0"
          >
            {{ badge }}
          </UBadge>
        </div>

        <div v-if="showTagline" class="truncate text-xs text-dimmed">
          <span v-if="prop">{{ prop }}</span>
          <span v-else class="italic">missing</span>
        </div>
      </div>
    </div>
</div>
</template>

<script setup lang="ts">
import { navigateTo } from '#imports'
import { computed } from 'vue'
import type { KitchenCard } from '../../../composables/fireux/firestore/kitchen/utils/view/useKitchenInterface'

type Props = Pick<KitchenCard.Card, 'id' | 'to' | 'name' | 'formattedAddress' | 'imageUrl' | 'imageShade'> & {
  badges?: KitchenCard.Card['badges']
  source?: 'google' | 'fireux' | 'manual'
  prop?: string
  showSubtitle?: boolean
  showSource?: boolean
  showBadges?: boolean
  showTagline?: boolean
  link?: boolean
  action?: boolean
  disabled?: boolean
}

const emit = defineEmits<{
  (event: 'action'): void
}>()

const props = withDefaults(defineProps<Props>(), {
  imageUrl: '',
  badges: () => [],
  prop: '',
  showSubtitle: true,
  showSource: false,
  showBadges: true,
  showTagline: true,
  link: false,
  action: false,
  disabled: false,
})

const resolvedAddress = computed(() => props.formattedAddress || '')

const resolvedImageUrl = computed(() => props.imageUrl || '')

const avatarShadeClass = computed(() => {
  const shade = props.imageShade
  if (!shade) return ''
  if (shade === 'light') return 'fx-avatar-shade--light'
  if (shade === 'dark') return 'fx-avatar-shade--dark'
  return ''
})

const sourceLabel = computed(() =>
  props.source === 'fireux'
    ? 'FireUX'
    : props.source === 'manual'
      ? 'Manual'
      : props.source === 'google'
        ? 'Google'
        : ''
)
const visibleBadges = computed(() =>
  props.showBadges === false ? [] : props.badges ?? []
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
