<template>
  <FireActionSurface
    v-if="directory"
    :to="surfaceTo"
    :action="action"
    class="place-collection-card"
    @activate="emit('action')"
  >
    <div class="place-collection-card__media">
      <img v-if="resolvedImageUrl" :src="resolvedImageUrl" alt="" loading="lazy">
      <UIcon v-else name="i-lucide-map-pin" aria-label="Venue photo not published" />
    </div>
    <div class="place-collection-card__body">
      <UBadge
        v-if="showSource && sourceLabel"
        variant="soft"
        color="neutral"
        size="xs"
      >
        {{ sourceLabel }}
      </UBadge>
      <h3>{{ name }}</h3>
      <span class="place-cell__address">
        <UIcon name="i-lucide-map-pin" aria-hidden="true" />
        <span>{{ resolvedAddress }}</span>
      </span>
      <p v-if="showTagline && prop" class="place-cell__tagline">{{ prop }}</p>
    </div>
  </FireActionSurface>

  <FireActionSurface
    v-else
    :to="surfaceTo"
    :action="action"
    class="fx-card--cell"
    @activate="emit('action')"
  >
    <UAvatar
      :src="resolvedImageUrl || undefined"
      :alt="name"
      size="md"
      icon="i-lucide-image"
      :class="avatarShadeClass"
      class="shrink-0"
    />

    <div class="min-w-0 flex-1 space-y-1">
      <div class="flex items-start justify-between gap-2">
        <div class="min-w-0">
          <div class="truncate text-sm font-semibold">{{ name }}</div>

          <div
            v-if="showSubtitle && resolvedAddress"
            class="flex items-center gap-1 truncate text-xs text-dimmed"
          >
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
      </div>

      <div v-if="showTagline" class="truncate text-xs text-dimmed">
        <span v-if="prop">{{ prop }}</span>
        <span v-else class="italic">missing</span>
      </div>
    </div>
  </FireActionSurface>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PlaceCard } from '../../composables/firestore/utils/view/usePlaceInterface'

type Props = Pick<
  PlaceCard.Card,
  'id' | 'to' | 'name' | 'formattedAddress' | 'imageUrl' | 'imageShade'
> & {
  source?: 'google' | 'fireux'
  prop?: string
  showSubtitle?: boolean
  showSource?: boolean
  showTagline?: boolean
  link?: boolean
  action?: boolean
  directory?: boolean
}

const emit = defineEmits<{
  (event: 'action'): void
}>()

const props = withDefaults(defineProps<Props>(), {
  source: 'fireux',
  prop: '',
  showSubtitle: true,
  showSource: false,
  showTagline: false,
  link: false,
  action: false,
  directory: false,
})

const resolvedAddress = computed(() => props.formattedAddress || '')
const resolvedImageUrl = computed(() => props.imageUrl || '')
const surfaceTo = computed(() => props.link && props.to ? props.to : undefined)

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
    : props.source === 'google'
      ? 'Google'
      : ''
)
</script>

<style scoped>
.place-collection-card { display: block; overflow: hidden; padding: 0; }
.place-collection-card__media { aspect-ratio: 16 / 10; background: var(--ui-bg-elevated); }
.place-collection-card__media > img { width: 100%; height: 100%; object-fit: cover; }
.place-collection-card__media > svg { width: 100%; height: 100%; padding: calc(var(--spacing) * 16); color: var(--ui-text-dimmed); }
.place-collection-card__body { display: grid; gap: calc(var(--spacing) * 3); padding: calc(var(--spacing) * 5); }
.place-collection-card__body h3 { margin: 0; color: var(--ui-text-highlighted); font-size: var(--text-xl); }
.place-cell__address {
  display: flex;
  min-width: 0;
  align-items: flex-start;
  gap: calc(var(--spacing) * 2);
}

.place-cell__address svg {
  width: calc(var(--spacing) * 4);
  height: calc(var(--spacing) * 4);
  flex: 0 0 auto;
}

.place-cell__address span {
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.place-cell__tagline {
  display: -webkit-box;
  margin: 0;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}
</style>
