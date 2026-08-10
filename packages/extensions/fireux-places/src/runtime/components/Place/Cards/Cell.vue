<template>
  <PublicEntityDirectoryCard
    v-if="directory"
    :to="surfaceTo"
    :action="action"
    :title="name"
    :image-url="resolvedImageUrl"
    image-alt=""
    media-fit="cover"
    fallback-icon="i-lucide-map-pin"
    fallback-label="Venue photo not published"
    @action="emit('action')"
  >
    <template v-if="showSource && sourceLabel" #badges>
      <UBadge
        variant="soft"
        color="neutral"
        size="xs"
      >
        {{ sourceLabel }}
      </UBadge>
    </template>

    <template v-if="showSubtitle && resolvedAddress" #meta>
      <span class="place-cell__address">
        <UIcon name="i-lucide-map-pin" aria-hidden="true" />
        <span>{{ resolvedAddress }}</span>
      </span>
    </template>

    <p v-if="showTagline" class="place-cell__tagline">
      {{ prop || 'Details not published' }}
    </p>
  </PublicEntityDirectoryCard>

  <MoleculesActionSurface
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
  </MoleculesActionSurface>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PlaceCard } from '../../../composables/fireux/firestore/place/utils/view/usePlaceInterface'

type Props = Pick<
  PlaceCard.Card,
  'id' | 'to' | 'name' | 'formattedAddress' | 'imageUrl'
> & {
  source?: 'google' | 'fireux' | 'manual'
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

const sourceLabel = computed(() =>
  props.source === 'fireux'
    ? 'FireUX'
    : props.source === 'manual'
      ? 'Manual'
      : props.source === 'google'
        ? 'Google'
        : ''
)
</script>

<style scoped>
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
