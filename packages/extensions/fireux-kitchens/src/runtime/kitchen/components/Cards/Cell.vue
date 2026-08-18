<template>
  <PublicEntityDirectoryCard
    v-if="directory"
    :to="link && to ? to : undefined"
    :action="action"
    :disabled="disabled"
    :title="displayName"
    :image-url="resolvedImageUrl"
    image-alt=""
    :media-fit="imageKind === 'brand' ? 'contain' : 'cover'"
    :media-background="imageKind === 'brand' ? mediaBackdropColor : ''"
    fallback-label="Venue photo unavailable"
    fallback-icon="i-lucide-image-off"
    @action="emit('action')"
  >
    <template v-if="visibleBadges.length" #badges>
      <UBadge
        v-for="badge in visibleBadges"
        :key="badge"
        variant="solid"
        color="neutral"
        size="xs"
      >
        {{ badge }}
      </UBadge>
    </template>

    <template #meta>
      <p
        class="kitchen-card-cell__address"
        :class="{ 'kitchen-card-cell__address--empty': !resolvedAddress }"
      >
        <UIcon name="i-lucide-map-pin" aria-hidden="true" />
        <span>{{ resolvedAddress || 'Location unavailable' }}</span>
      </p>
    </template>

    <p v-if="showTagline && prop" class="kitchen-card-cell__directory-tagline">
      {{ prop }}
    </p>
  </PublicEntityDirectoryCard>

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
import type { KitchenCard } from '../../composables/firestore/utils/view/useKitchenInterface'

type Props = Partial<Pick<
  KitchenCard.Card,
  | 'id'
  | 'to'
  | 'name'
  | 'shortAddress'
  | 'imageUrl'
  | 'imageShade'
  | 'imageKind'
>> & {
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
