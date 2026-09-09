<template>
  <MoleculesActionSurface
    v-if="directory"
    :to="link && to ? to : undefined"
    class="kitchen-collection-card"
  >
    <div class="kitchen-collection-card__media">
      <img v-if="resolvedImageUrl" :src="resolvedImageUrl" alt="" loading="lazy">
      <UIcon v-else name="i-lucide-image-off" aria-label="Venue photo unavailable" />
      <UAvatar
        v-if="logoImageUrl"
        :src="logoImageUrl"
        :alt="`${displayName} logo`"
        size="xl"
        class="kitchen-collection-card__logo"
      />
    </div>
    <div class="kitchen-collection-card__body">
      <div v-if="visibleBadges.length" class="kitchen-collection-card__badges">
      <UBadge
        v-for="badge in visibleBadges"
        :key="badge"
        color="neutral"
        variant="solid"
      >
        {{ badge }}
      </UBadge>
      </div>
      <h3>{{ displayName }}</h3>
      <div v-if="categoryLabels.length" class="kitchen-collection-card__categories">
        <span v-for="label in categoryLabels" :key="label">{{ label.replaceAll('_', ' ') }}</span>
      </div>
      <p class="kitchen-card-cell__address">
        <UIcon name="i-lucide-map-pin" aria-hidden="true" />
        <span>{{ resolvedAddress || 'Location available on profile' }}</span>
      </p>
      <p v-if="tagline || about || prop" class="kitchen-card-cell__directory-tagline">
        {{ tagline || about || prop }}
      </p>
    <div v-if="estimatedMinutes || fulfilmentModes.length || priceLevel" class="kitchen-card-cell__directory-facts">
      <span v-if="estimatedMinutes">
        {{ estimatedMinutes.min }}–{{ estimatedMinutes.max }} min
      </span>
      <span v-if="priceLevel">Price {{ priceLevel }}/4</span>
      <span v-for="mode in fulfilmentModes" :key="mode">
        {{ fulfilmentLabel(mode) }}
      </span>
    </div>
    </div>
  </MoleculesActionSurface>

  <MoleculesActionSurface
    v-else
    :to="link && to ? to : undefined"
    :action="action"
    :disabled="disabled"
    :data-selected="selected || undefined"
    class="card card--cell kitchen-card-cell"
    :class="cardClass"
    @activate="emit('action')"
  >
    <div class="card__media">
      <UAvatar
        :src="resolvedImageUrl || undefined"
        :alt="displayName"
        size="md"
        :icon="imageKind === 'brand' ? 'i-lucide-chef-hat' : 'i-lucide-image'"
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

          <div v-if="visibleBadges.length" class="card__badges">
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
import type { KitchenCard } from '../../models/kitchen-interface.model'

type Props = Partial<
  Pick<
    KitchenCard.Card,
    | 'id'
    | 'to'
    | 'name'
    | 'shortAddress'
    | 'imageUrl'
    | 'imageShade'
    | 'imageKind'
    | 'tagline'
    | 'about'
    | 'priceLevel'
    | 'fulfilmentModes'
    | 'estimatedMinutes'
    | 'logoImageUrl'
    | 'categoryLabels'
  >
> & {
  badges?: KitchenCard.Card['badges']
  mediaBackdropColor?: string
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
  imageKind: 'photograph',
  logoImageUrl: '',
  categoryLabels: () => [],
  tagline: '',
  about: '',
  priceLevel: '',
  fulfilmentModes: () => [],
  badges: () => [],
  mediaBackdropColor: '',
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
const fulfilmentLabel = (mode: string) =>
  ({
    delivery: 'Delivery',
    collection: 'Collection',
    dine_in: 'Dine in',
    takeaway: 'Takeaway',
  })[mode] || mode

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
        (badge) => String(badge).trim().toLocaleLowerCase() !== 'active'
      )
)
const cardClass = computed(() => ({
  'cursor-pointer':
    !props.disabled && (props.action || (props.link && props.to)),
}))
</script>

<style scoped>
.kitchen-card-cell {
  min-height: 6.5rem;
}

.kitchen-collection-card { display: block; overflow: hidden; padding: 0; }
.kitchen-collection-card__media { position: relative; aspect-ratio: 16 / 10; background: var(--ui-bg-elevated); }
.kitchen-collection-card__media > img { width: 100%; height: 100%; object-fit: cover; }
.kitchen-collection-card__media > svg { width: 100%; height: 100%; padding: calc(var(--spacing) * 16); color: var(--ui-text-dimmed); }
.kitchen-collection-card__logo { position: absolute; right: calc(var(--spacing) * 4); bottom: calc(var(--spacing) * -6); border: 3px solid var(--ui-bg); background: var(--ui-bg); }
.kitchen-collection-card__body { display: grid; gap: calc(var(--spacing) * 3); padding: calc(var(--spacing) * 6); }
.kitchen-collection-card__body h3 { margin: 0; color: var(--ui-text-highlighted); font-size: var(--text-xl); }
.kitchen-collection-card__badges { display: flex; gap: var(--spacing); }
.kitchen-collection-card__categories { display: flex; flex-wrap: wrap; gap: calc(var(--spacing) * 2); color: var(--ui-text-muted); font-size: var(--text-xs); text-transform: capitalize; }

.kitchen-card-cell__directory-facts {
  display: flex;
  flex-wrap: wrap;
  gap: calc(var(--spacing) * 2);
  align-items: center;
  color: var(--ui-text-muted);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-semibold);
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

.kitchen-card-cell__directory-tagline {
  margin: 0;
  color: var(--ui-text-toned);
  font-size: var(--text-sm);
  line-height: var(--leading-relaxed);
  white-space: normal;
}
</style>
