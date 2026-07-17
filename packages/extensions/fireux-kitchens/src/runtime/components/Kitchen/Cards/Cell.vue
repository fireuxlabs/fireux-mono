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
        class="kitchen-card-cell__avatar"
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
            v-if="visibleBadges.length"
            class="card__badges"
          >
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

      <div v-if="directory" class="kitchen-card-cell__arrow" aria-hidden="true">
        <UIcon name="i-lucide-arrow-up-right" />
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
        class="kitchen-card-cell__avatar"
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
            v-if="visibleBadges.length"
            class="card__badges"
          >
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

      <div v-if="directory" class="kitchen-card-cell__arrow" aria-hidden="true">
        <UIcon name="i-lucide-arrow-up-right" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { navigateTo } from '#imports'
import { computed } from 'vue'
import type { KitchenCard } from '../../../composables/fireux/firestore/kitchen/utils/view/useKitchenInterface'

type Props = Partial<Pick<KitchenCard.Card, 'id' | 'to' | 'name' | 'shortAddress' | 'imageUrl' | 'imageShade'>> & {
  badges?: KitchenCard.Card['badges']
  prop?: string
  showSubtitle?: boolean
  showBadges?: boolean
  showTagline?: boolean
  link?: boolean
  action?: boolean
  disabled?: boolean
  selected?: boolean
  directory?: boolean
}

const emit = defineEmits<{
  (event: 'action'): void
}>()

const props = withDefaults(defineProps<Props>(), {
  id: '',
  to: '',
  name: '',
  shortAddress: '',
  imageUrl: '',
  badges: () => [],
  prop: '',
  showSubtitle: true,
  showBadges: true,
  showTagline: true,
  link: false,
  action: false,
  disabled: false,
  selected: false,
  directory: false,
})

const resolvedAddress = computed(() => props.shortAddress || '')

const resolvedImageUrl = computed(() => props.imageUrl || '')

const avatarShadeClass = computed(() => {
  const shade = props.imageShade
  if (!shade) return ''
  if (shade === 'light') return 'fx-avatar-shade--light'
  if (shade === 'dark') return 'fx-avatar-shade--dark'
  return ''
})

const visibleBadges = computed(() =>
  props.showBadges === false ? [] : props.badges ?? []
)
const cardClass = computed(() => ({
  'cursor-pointer': props.action || (props.link && props.to),
  'cursor-not-allowed opacity-60': props.disabled,
  'kitchen-card-cell--selected': props.selected,
  'kitchen-card-cell--directory': props.directory,
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
.kitchen-card-cell--directory {
  min-height: 9.5rem;
  padding: 1.25rem;
  border-color: color-mix(in srgb, var(--ui-primary) 13%, var(--ui-border));
  border-radius: 1.25rem;
  background:
    linear-gradient(
      145deg,
      color-mix(in srgb, var(--ui-primary) 5%, var(--ui-bg)),
      var(--ui-bg) 58%
    );
}

.kitchen-card-cell--directory:hover {
  border-color: color-mix(in srgb, var(--ui-primary) 35%, var(--ui-border));
  background:
    linear-gradient(
      145deg,
      color-mix(in srgb, var(--ui-primary) 9%, var(--ui-bg)),
      var(--ui-bg) 68%
    );
  box-shadow: 0 18px 38px rgba(15, 23, 42, 0.1);
  transform: translateY(-2px);
}

.kitchen-card-cell--directory .card__media {
  align-items: flex-start;
  height: 100%;
  gap: 1rem;
}

.kitchen-card-cell--directory .kitchen-card-cell__avatar {
  width: 3.75rem;
  height: 3.75rem;
}

.kitchen-card-cell--directory .card__stack {
  gap: 0.55rem;
}

.kitchen-card-cell--directory .card__title {
  font-size: 1.05rem;
  white-space: normal;
  overflow-wrap: anywhere;
  line-height: 1.35;
}

.kitchen-card-cell--directory .card__subtitle,
.kitchen-card-cell--directory .card__tagline {
  font-size: 0.8rem;
  white-space: normal;
  line-height: 1.45;
}

.kitchen-card-cell__arrow {
  display: grid;
  width: 2rem;
  height: 2rem;
  flex: 0 0 auto;
  place-items: center;
  border: 1px solid var(--ui-border);
  border-radius: 999px;
  color: var(--ui-text-muted);
  transition: border-color 160ms ease, background-color 160ms ease,
    color 160ms ease, transform 160ms ease;
}

.kitchen-card-cell--directory:hover .kitchen-card-cell__arrow {
  border-color: var(--ui-primary);
  background: var(--ui-primary);
  color: var(--ui-bg);
  transform: rotate(8deg);
}

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
