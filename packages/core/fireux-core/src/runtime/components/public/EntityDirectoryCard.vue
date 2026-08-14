<template>
  <MoleculesActionSurface
    :to="props.to"
    :action="props.action"
    :disabled="props.disabled"
    class="card card--cell public-entity-directory-card"
    :data-media-fit="props.mediaFit"
    :style="mediaStyle"
    @activate="emit('action')"
  >
    <div class="public-entity-directory-card__media">
      <img
        v-if="hasResolvedImage"
        :src="resolvedImageUrl"
        :alt="resolvedImageAlt"
        loading="lazy"
        decoding="async"
        draggable="false"
        @error="imageLoadFailed = true"
      >

      <div
        v-else
        class="public-entity-directory-card__fallback"
        :aria-label="props.fallbackLabel"
        role="img"
      >
        <UIcon :name="props.fallbackIcon" aria-hidden="true" />
        <span>{{ props.fallbackLabel }}</span>
      </div>

      <div
        v-if="$slots.badges"
        class="public-entity-directory-card__badges"
      >
        <slot name="badges" />
      </div>
    </div>

    <div class="public-entity-directory-card__sheet">
      <div class="public-entity-directory-card__content">
        <div class="public-entity-directory-card__heading">
          <h3 class="public-entity-directory-card__title">
            {{ props.title }}
          </h3>

          <span
            v-if="isInteractive"
            class="public-entity-directory-card__arrow"
            aria-hidden="true"
          >
            <UIcon name="i-lucide-arrow-up-right" />
          </span>
        </div>

        <div
          v-if="$slots.meta"
          class="public-entity-directory-card__meta"
        >
          <slot name="meta" />
        </div>

        <div
          v-if="$slots.default"
          class="public-entity-directory-card__body"
        >
          <slot />
        </div>
      </div>
    </div>
  </MoleculesActionSurface>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { RouteLocationRaw } from 'vue-router'

defineOptions({ name: 'PublicEntityDirectoryCard' })

type EntityDirectoryMediaFit = 'contain' | 'cover'

const emit = defineEmits<{
  (event: 'action'): void
}>()

const props = withDefaults(
  defineProps<{
    action?: boolean
    disabled?: boolean
    fallbackIcon?: string
    fallbackLabel?: string
    imageAlt?: string
    imageUrl?: string
    mediaBackground?: string
    mediaFit?: EntityDirectoryMediaFit
    title: string
    to?: RouteLocationRaw
  }>(),
  {
    action: false,
    disabled: false,
    fallbackIcon: 'i-lucide-image-off',
    fallbackLabel: 'Image not published',
    imageAlt: '',
    imageUrl: '',
    mediaBackground: '',
    mediaFit: 'cover',
  }
)

const resolvedImageUrl = computed(() => props.imageUrl.trim())
const resolvedImageAlt = computed(() => props.imageAlt.trim())
const mediaStyle = computed(() => {
  const background = props.mediaBackground.trim()
  return background
    ? { '--fx-entity-media-bg': background }
    : undefined
})
const imageLoadFailed = ref(false)
const hasResolvedImage = computed(
  () => Boolean(resolvedImageUrl.value) && !imageLoadFailed.value
)
const isInteractive = computed(
  () => !props.disabled && Boolean(props.to || props.action)
)

watch(resolvedImageUrl, () => {
  imageLoadFailed.value = false
})
</script>

<style scoped>
.public-entity-directory-card {
  display: grid;
  grid-template-columns: minmax(calc(var(--spacing) * 30), 38%) minmax(0, 1fr);
  grid-template-rows: minmax(0, 1fr);
  width: 100%;
  height: 100%;
  min-height: calc(var(--spacing) * 42);
  padding: 0;
  border-color: color-mix(in srgb, var(--ui-primary) 18%, var(--ui-border));
  border-radius: calc(var(--ui-radius) * 4);
  background: var(--fx-entity-media-bg, var(--ui-bg-elevated));
  color: inherit;
  font: inherit;
  text-decoration: none;
}

.public-entity-directory-card__media {
  position: relative;
  min-width: 0;
  min-height: 100%;
  overflow: hidden;
  border-right: 1px solid
    color-mix(in srgb, var(--ui-primary) 14%, var(--ui-border));
  background: var(--ui-bg-elevated);
}

.public-entity-directory-card__media > img {
  display: block;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.public-entity-directory-card[data-media-fit='contain']
  .public-entity-directory-card__media
  > img {
  padding: calc(var(--spacing) * 4);
  object-fit: contain;
}

.public-entity-directory-card__fallback {
  display: grid;
  height: 100%;
  min-height: calc(var(--spacing) * 32);
  place-content: center;
  justify-items: center;
  gap: calc(var(--spacing) * 3);
  padding: calc(var(--spacing) * 4);
  color: var(--ui-text-muted);
  text-align: center;
}

.public-entity-directory-card__fallback :deep(svg) {
  width: calc(var(--spacing) * 8);
  height: calc(var(--spacing) * 8);
  color: var(--ui-text-dimmed);
}

.public-entity-directory-card__fallback span {
  font-size: var(--text-xs);
  font-weight: var(--font-weight-medium);
  line-height: var(--leading-snug);
}

.public-entity-directory-card__badges {
  position: absolute;
  top: calc(var(--spacing) * 3);
  right: calc(var(--spacing) * 3);
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: var(--spacing);
}

.public-entity-directory-card__sheet {
  position: relative;
  z-index: 1;
  display: flex;
  min-width: 0;
  margin: calc(var(--spacing) * 3) calc(var(--spacing) * 3)
    calc(var(--spacing) * 3) calc(var(--spacing) * -4);
  padding: calc(var(--spacing) * 4);
  border: 1px solid
    color-mix(in srgb, var(--ui-primary) 20%, var(--ui-border));
  border-radius: calc(var(--ui-radius) * 3);
  background: var(--ui-bg);
  box-shadow: var(--shadow-md);
  transition: border-color 180ms ease;
}

.public-entity-directory-card__content {
  display: grid;
  min-width: 0;
  align-content: start;
  gap: calc(var(--spacing) * 2);
}

.public-entity-directory-card__heading {
  display: flex;
  min-width: 0;
  align-items: flex-start;
  justify-content: space-between;
  gap: calc(var(--spacing) * 3);
}

.public-entity-directory-card__title {
  max-width: 22ch;
  margin: 0;
  overflow-wrap: anywhere;
  color: var(--ui-text-highlighted);
  font-size: clamp(var(--text-lg), 5vw, var(--text-xl));
  font-weight: var(--font-weight-bold);
  letter-spacing: var(--tracking-tight);
  line-height: var(--leading-tight);
  text-wrap: balance;
}

.public-entity-directory-card__meta {
  min-width: 0;
  color: var(--ui-text-muted);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-semibold);
  line-height: var(--leading-snug);
}

.public-entity-directory-card__body {
  min-width: 0;
  color: var(--ui-text-toned);
  font-size: var(--text-sm);
  line-height: var(--leading-relaxed);
}

.public-entity-directory-card__arrow {
  display: grid;
  width: calc(var(--spacing) * 8);
  height: calc(var(--spacing) * 8);
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

.public-entity-directory-card:not([data-disabled='true']):not(
    [aria-disabled='true']
  ):not(:disabled):hover
  .public-entity-directory-card__sheet,
.public-entity-directory-card:focus-visible
  .public-entity-directory-card__sheet {
  border-color: color-mix(in srgb, var(--ui-primary) 44%, var(--ui-border));
}

.public-entity-directory-card:not([data-disabled='true']):not(
    [aria-disabled='true']
  ):not(:disabled):hover
  .public-entity-directory-card__arrow,
.public-entity-directory-card:focus-visible
  .public-entity-directory-card__arrow {
  border-color: var(--ui-primary);
  color: var(--ui-text-highlighted);
  transform: translate(
    calc(var(--spacing) * 0.5),
    calc(var(--spacing) * -0.5)
  );
}

@media (min-width: 40rem) {
  .public-entity-directory-card {
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: auto minmax(0, 1fr);
    min-height: calc(var(--spacing) * 82);
  }

  .public-entity-directory-card__media {
    min-height: 0;
    aspect-ratio: 5 / 3;
    border-right: 0;
    border-bottom: 1px solid
      color-mix(in srgb, var(--ui-primary) 14%, var(--ui-border));
  }

  .public-entity-directory-card__sheet {
    width: calc(100% - calc(var(--spacing) * 8));
    margin: calc(var(--spacing) * -6) auto calc(var(--spacing) * 4);
    padding: calc(var(--spacing) * 5);
  }

  .public-entity-directory-card__content {
    gap: calc(var(--spacing) * 3);
  }

  .public-entity-directory-card__title {
    font-size: clamp(var(--text-xl), 2vw, var(--text-2xl));
  }
}

@media (prefers-reduced-motion: reduce) {
  .public-entity-directory-card__sheet,
  .public-entity-directory-card__arrow {
    transition: none;
  }

  .public-entity-directory-card:hover
    .public-entity-directory-card__arrow,
  .public-entity-directory-card:focus-visible
    .public-entity-directory-card__arrow {
    transform: none;
  }
}
</style>
