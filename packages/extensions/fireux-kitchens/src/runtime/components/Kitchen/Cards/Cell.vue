<template>
  <NuxtLink
    v-if="link && to"
    :to="to"
    class="card card--cell kitchen-card-cell"
    :class="cardClass"
  >
    <div class="card__media">
      <UAvatar
        :src="resolvedImageUrl || undefined"
        :alt="name"
        size="md"
        icon="i-lucide-image"
        :class="avatarShadeClass"
      />

      <div class="card__content card__stack">
        <div class="card__header">
          <div class="min-w-0">
            <div class="card__title">{{ name }}</div>

            <div
              v-if="showSubtitle && resolvedAddress"
              class="card__subtitle inline-flex max-w-full items-center gap-1"
            >
              <UIcon name="i-lucide-map-pin" class="h-3 w-3" />
              <span class="truncate">{{ resolvedAddress }}</span>
            </div>
          </div>

          <div
            v-if="(showSource && sourceLabel) || visibleBadges.length"
            class="card__badges"
          >
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
        </div>

        <div v-if="showTagline && prop" class="card__tagline">
          {{ prop }}
        </div>
      </div>
    </div>
  </NuxtLink>

  <div
    v-else
    class="card card--cell kitchen-card-cell"
    :class="cardClass"
    @click="onClick"
  >
    <div class="card__media">
      <UAvatar
        :src="resolvedImageUrl || undefined"
        :alt="name"
        size="md"
        icon="i-lucide-image"
        :class="avatarShadeClass"
      />

      <div class="card__content card__stack">
        <div class="card__header">
          <div class="min-w-0">
            <div class="card__title">{{ name }}</div>

            <div
              v-if="showSubtitle && resolvedAddress"
              class="card__subtitle inline-flex max-w-full items-center gap-1"
            >
              <UIcon name="i-lucide-map-pin" class="h-3 w-3" />
              <span class="truncate">{{ resolvedAddress }}</span>
            </div>
          </div>

          <div
            v-if="(showSource && sourceLabel) || visibleBadges.length"
            class="card__badges"
          >
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
        </div>

        <div v-if="showTagline && prop" class="card__tagline">
          {{ prop }}
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
  selected?: boolean
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
  selected: false,
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
const cardClass = computed(() => ({
  'cursor-pointer': props.action || (props.link && props.to),
  'cursor-not-allowed opacity-60': props.disabled,
  'kitchen-card-cell--selected': props.selected,
}))

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

<style scoped>
.kitchen-card-cell--selected {
  border-color: color-mix(in srgb, var(--ui-primary) 52%, var(--ui-border));
  background:
    linear-gradient(
      135deg,
      color-mix(in srgb, var(--ui-primary) 14%, transparent),
      color-mix(in srgb, var(--ui-primary) 4%, transparent)
    ),
    var(--ui-bg);
  box-shadow:
    0 0 0 1px color-mix(in srgb, var(--ui-primary) 20%, transparent),
    0 12px 28px rgba(15, 23, 42, 0.08);
}

.kitchen-card-cell--selected:hover {
  border-color: color-mix(in srgb, var(--ui-primary) 66%, var(--ui-border));
}
</style>
