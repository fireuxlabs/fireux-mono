<template>
  <MoleculesActionSurface
    :to="link && to ? to : undefined"
    :action="action"
    :disabled="disabled"
    class="card card--cell kitchen-card-cell"
    :class="cardClass"
    @activate="emit('action')"
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
  </MoleculesActionSurface>
</template>

<script setup lang="ts">
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
  props.showBadges === false
    ? []
    : (props.badges ?? []).filter(
        badge => String(badge).trim().toLocaleLowerCase() !== 'active'
      )
)
const cardClass = computed(() => ({
  'cursor-pointer': !props.disabled && (props.action || (props.link && props.to)),
  'kitchen-card-cell--selected': props.selected,
  'kitchen-card-cell--directory': props.directory,
}))
</script>

<style scoped>
.kitchen-card-cell {
  min-height: 6.5rem;
  padding: calc(var(--spacing) * 3);
  border-color: color-mix(in srgb, var(--ui-border) 72%, transparent);
  border-radius: calc(var(--ui-radius) * 6);
  background:
    radial-gradient(
      circle at 0 0,
      color-mix(in srgb, var(--ui-primary) 9%, transparent),
      transparent 42%
    ),
    linear-gradient(
      145deg,
      color-mix(in srgb, var(--ui-bg-elevated) 98%, var(--ui-primary) 2%),
      var(--ui-bg) 76%
    );
}

.kitchen-card-cell .card__media {
  align-items: center;
  gap: calc(var(--spacing) * 3);
}

.kitchen-card-cell .kitchen-card-cell__avatar {
  width: 5rem;
  height: 5rem;
  flex: 0 0 auto;
  border: 1px solid color-mix(in srgb, var(--ui-border) 76%, transparent);
  border-radius: calc(var(--ui-radius) * 4);
  background: color-mix(in srgb, var(--ui-bg-elevated) 94%, transparent);
  box-shadow:
    0 1px 0 color-mix(in srgb, white 10%, transparent) inset,
    0 0.65rem 1.4rem color-mix(in srgb, var(--ui-bg-inverted) 12%, transparent);
}

.kitchen-card-cell .card__stack {
  gap: var(--spacing);
}

.kitchen-card-cell .card__title {
  font-size: var(--text-base);
  letter-spacing: var(--tracking-tight);
  line-height: var(--leading-tight);
}

.kitchen-card-cell .card__subtitle {
  margin-top: var(--spacing);
  font-size: 0.6875rem;
  font-weight: var(--font-weight-semibold);
  letter-spacing: 0.055em;
  text-transform: uppercase;
}

.kitchen-card-cell .card__subtitle svg {
  opacity: 0.72;
}

.kitchen-card-cell .card__tagline {
  display: -webkit-box;
  color: var(--ui-text-highlighted);
  font-size: var(--text-xs);
  font-style: italic;
  white-space: normal;
  line-height: 1.45;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.kitchen-card-cell .card__badges {
  padding-left: calc(var(--spacing) * 2);
}

.kitchen-card-cell--directory {
  min-height: 9.5rem;
  padding: calc(var(--spacing) * 5);
  border-color: color-mix(in srgb, var(--ui-primary) 13%, var(--ui-border));
  border-radius: calc(var(--ui-radius) * 6);
  background:
    linear-gradient(
      145deg,
      color-mix(in srgb, var(--ui-primary) 5%, var(--ui-bg)),
      var(--ui-bg) 58%
    );
}

.kitchen-card-cell--directory:not([data-disabled='true']):not([aria-disabled='true']):not(:disabled):hover {
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
  gap: calc(var(--spacing) * 4);
}

.kitchen-card-cell--directory .kitchen-card-cell__avatar {
  width: 5.25rem;
  height: 5.25rem;
}

.kitchen-card-cell--directory .card__stack {
  gap: 0.55rem;
}

.kitchen-card-cell--directory .card__title {
  font-size: var(--text-lg);
  white-space: normal;
  overflow-wrap: anywhere;
  line-height: var(--leading-snug);
}

.kitchen-card-cell--directory .card__subtitle,
.kitchen-card-cell--directory .card__tagline {
  font-size: var(--text-xs);
  white-space: normal;
  line-height: var(--leading-snug);
}

.kitchen-card-cell__arrow {
  display: grid;
  width: 2rem;
  height: 2rem;
  flex: 0 0 auto;
  place-items: center;
  border: 1px solid var(--ui-border);
  border-radius: 9999px;
  color: var(--ui-text-muted);
  transition: border-color 160ms ease, background-color 160ms ease,
    color 160ms ease, transform 160ms ease;
}

.kitchen-card-cell--directory:not([data-disabled='true']):not([aria-disabled='true']):not(:disabled):hover .kitchen-card-cell__arrow {
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

.kitchen-card-cell--selected:not([data-disabled='true']):not([aria-disabled='true']):not(:disabled):hover {
  border-color: color-mix(in srgb, var(--ui-primary) 66%, var(--ui-border));
}
</style>
