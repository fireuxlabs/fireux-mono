<template>
  <MoleculesActionSurface
    :to="link && to ? to : undefined"
    :action="action"
    :disabled="disabled"
    :data-selected="selected || undefined"
    class="card card--cell kitchen-card-cell"
    :class="cardClass"
    @activate="emit('action')"
  >
    <template v-if="directory">
      <div class="kitchen-card-cell__directory-media">
        <img
          v-if="resolvedImageUrl"
          :src="resolvedImageUrl"
          :alt="`${displayName} kitchen`"
          loading="lazy"
          decoding="async"
          draggable="false"
        >

        <div
          v-else
          class="kitchen-card-cell__placeholder"
          aria-label="Venue photo not published"
          role="img"
        >
          <UIcon name="i-lucide-image-off" aria-hidden="true" />
          <span>Venue photo not published</span>
        </div>

        <div
          v-if="visibleBadges.length"
          class="kitchen-card-cell__directory-badges"
        >
          <UBadge
            v-for="badge in visibleBadges"
            :key="badge"
            variant="solid"
            color="neutral"
            size="xs"
          >
            {{ badge }}
          </UBadge>
        </div>
      </div>

      <div class="kitchen-card-cell__directory-body">
        <div class="kitchen-card-cell__directory-copy">
          <h3 class="card__title">{{ displayName }}</h3>

          <p
            class="card__subtitle kitchen-card-cell__address"
            :class="{ 'kitchen-card-cell__address--empty': !resolvedAddress }"
          >
            <UIcon name="i-lucide-map-pin" aria-hidden="true" />
            <span>
              {{ resolvedAddress || 'Location not published' }}
            </span>
          </p>

          <p v-if="showTagline && prop" class="card__tagline">
            {{ prop }}
          </p>
        </div>

        <div
          v-if="isInteractive"
          class="kitchen-card-cell__directory-action"
          aria-hidden="true"
        >
          <span>{{ actionLabel }}</span>
          <span class="kitchen-card-cell__arrow">
            <UIcon name="i-lucide-arrow-up-right" />
          </span>
        </div>
      </div>
    </template>

    <div v-else class="card__media">
      <UAvatar
        :src="resolvedImageUrl || undefined"
        :alt="displayName"
        size="md"
        icon="i-lucide-image"
        class="kitchen-card-cell__avatar"
        :class="avatarShadeClass"
      />

      <div class="card__content card__stack">
        <div class="card__header">
          <div class="min-w-0">
            <div class="card__title">{{ displayName }}</div>

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
const displayName = computed(() => props.name || 'Kitchen')
const isInteractive = computed(() =>
  !props.disabled && Boolean(props.action || (props.link && props.to))
)
const actionLabel = computed(() =>
  props.action && !(props.link && props.to) ? 'Select kitchen' : 'View kitchen'
)

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
  'kitchen-card-cell--directory': props.directory,
}))
</script>

<style scoped>
.kitchen-card-cell {
  min-height: 6.5rem;
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
  font-size: var(--text-xs);
  font-weight: var(--font-weight-semibold);
}

.kitchen-card-cell .card__subtitle svg {
  opacity: 0.72;
}

.kitchen-card-cell .card__tagline {
  display: -webkit-box;
  color: var(--ui-text-highlighted);
  font-size: var(--text-xs);
  white-space: normal;
  line-height: var(--leading-relaxed);
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.kitchen-card-cell .card__badges {
  padding-left: calc(var(--spacing) * 2);
}

.kitchen-card-cell--directory {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  height: 100%;
  min-height: calc(var(--spacing) * 88);
  padding: 0;
  border-radius: calc(var(--ui-radius) * 3);
}

.kitchen-card-cell__directory-media {
  position: relative;
  overflow: hidden;
  aspect-ratio: 16 / 10;
  border-bottom: 1px solid var(--ui-border);
  background: var(--ui-bg-elevated);
}

.kitchen-card-cell__directory-media > img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.kitchen-card-cell__placeholder {
  display: grid;
  height: 100%;
  place-content: center;
  justify-items: center;
  gap: calc(var(--spacing) * 3);
  padding: calc(var(--spacing) * 6);
  color: var(--ui-text-muted);
  text-align: center;
}

.kitchen-card-cell__placeholder :deep(svg) {
  width: calc(var(--spacing) * 8);
  height: calc(var(--spacing) * 8);
  color: var(--ui-text-dimmed);
}

.kitchen-card-cell__placeholder span {
  font-size: var(--text-xs);
  font-weight: var(--font-weight-medium);
}

.kitchen-card-cell__directory-badges {
  position: absolute;
  top: calc(var(--spacing) * 3);
  right: calc(var(--spacing) * 3);
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: var(--spacing);
}

.kitchen-card-cell__directory-body {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: calc(var(--spacing) * 5);
  padding: calc(var(--spacing) * 5);
}

.kitchen-card-cell__directory-copy {
  display: grid;
  gap: calc(var(--spacing) * 3);
}

.kitchen-card-cell--directory .card__title {
  font-size: var(--text-xl);
  white-space: normal;
  overflow-wrap: anywhere;
  line-height: var(--leading-snug);
}

.kitchen-card-cell__address {
  display: flex;
  align-items: flex-start;
  gap: calc(var(--spacing) * 2);
  margin: 0;
}

.kitchen-card-cell__address :deep(svg) {
  width: calc(var(--spacing) * 4);
  height: calc(var(--spacing) * 4);
  flex: 0 0 auto;
  margin-top: calc(var(--spacing) * 0.5);
  color: var(--ui-primary);
}

.kitchen-card-cell__address--empty {
  color: var(--ui-text-dimmed);
}

.kitchen-card-cell--directory .card__tagline {
  margin: 0;
  color: var(--ui-text-toned);
  font-size: var(--text-sm);
  white-space: normal;
  line-height: var(--leading-relaxed);
}

.kitchen-card-cell__directory-action {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: calc(var(--spacing) * 3);
  padding-top: calc(var(--spacing) * 4);
  border-top: 1px solid var(--ui-border);
  color: var(--ui-text-muted);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-semibold);
}

.kitchen-card-cell__arrow {
  display: grid;
  width: 2rem;
  height: 2rem;
  flex: 0 0 auto;
  place-items: center;
  border: 1px solid var(--ui-border);
  border-radius: 9999px;
  background: var(--ui-bg-elevated);
  color: var(--ui-primary);
  transition:
    border-color 180ms ease,
    color 180ms ease,
    transform 180ms ease;
}

.kitchen-card-cell--directory:not([data-disabled='true']):not([aria-disabled='true']):not(:disabled):hover .kitchen-card-cell__arrow {
  border-color: var(--ui-primary);
  color: var(--ui-text-highlighted);
  transform: translate(calc(var(--spacing) * 0.5), calc(var(--spacing) * -0.5));
}

@media (prefers-reduced-motion: reduce) {
  .kitchen-card-cell__arrow {
    transition: none;
  }

  .kitchen-card-cell--directory:not([data-disabled='true']):not([aria-disabled='true']):not(:disabled):hover .kitchen-card-cell__arrow {
    transform: none;
  }
}
</style>
