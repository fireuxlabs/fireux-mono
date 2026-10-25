<template>
  <UCard
    :class="cardClass"
    :ui="cardUi"
    :role="liveRole"
    :aria-live="liveMode"
    :aria-busy="showSpinner"
    aria-atomic="true"
  >
    <div v-if="isBanner" class="fx-state-banner" :class="bannerClass">
      <p class="fx-state-banner__title">
        <slot name="title">{{ resolvedTitle }}</slot>
      </p>
      <p v-if="showBannerDescription" class="fx-state-banner__description">
        <slot name="description">
          {{ bannerDescription }}
        </slot>
      </p>
      <slot v-if="hasDefaultSlot" />
    </div>

    <div v-else class="fx-state-card__content">
      <UIcon
        v-if="showSpinner"
        name="i-lucide-loader-2"
        class="fx-state-card__spinner"
        aria-hidden="true"
      />
      <UIcon
        v-else-if="resolvedIcon"
        :name="resolvedIcon"
        class="fx-state-card__icon"
        aria-hidden="true"
      />
      <p class="fx-state-card__title">
        <slot name="title">{{ resolvedTitle }}</slot>
      </p>
      <p v-if="showDescription" class="fx-state-card__description">
        <slot name="description">
          {{ showSpinner ? loadingDescription : resolvedDescription }}
        </slot>
      </p>
      <slot />
      <div v-if="$slots.actions" class="fx-state-card__actions">
        <slot name="actions" />
      </div>
    </div>
    <FireCopyError
      v-if="resolvedState === 'error'"
      :message="[resolvedTitle, resolvedDescription].filter(Boolean).join('\n')"
    />
  </UCard>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue'

const props = withDefaults(
  defineProps<{
    entity?: string
    kind?: 'document' | 'collection'
    state?: 'loading' | 'empty' | 'missing' | 'error'
    surface?: 'card' | 'bare' | 'collection'
    title?: string
    description?: string
    icon?: string | null
    loading?: boolean
    layout?: 'card' | 'banner'
    uppercase?: boolean
  }>(),
  {
    kind: 'collection',
    state: undefined,
    surface: 'card',
    icon: undefined,
    title: '',
    description: '',
    loading: false,
    layout: 'card',
  }
)

const slots = useSlots()

const capitalize = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1)

const isBanner = computed(() => props.layout === 'banner')
const resolvedState = computed(() => {
  if (props.loading) return 'loading'
  if (props.state) return props.state
  return props.kind === 'document' ? 'missing' : 'empty'
})
const showSpinner = computed(() => resolvedState.value === 'loading')
const hasDescriptionSlot = computed(() => Boolean(slots.description))
const hasDefaultSlot = computed(() => Boolean(slots.default))
const liveRole = computed(() =>
  resolvedState.value === 'error' ? 'alert' : 'status'
)
const liveMode = computed(() =>
  resolvedState.value === 'error' ? 'assertive' : 'polite'
)

const defaultEntity = computed(() => props.entity?.trim().toLowerCase() ?? '')

const loadingTitle = computed(() => {
  const target = defaultEntity.value
  if (!target) return 'Loading…'
  return `Loading ${target}`
})

const resolvedTitle = computed(() => {
  if (props.title) return props.title
  if (showSpinner.value) return loadingTitle.value

  const name = props.entity?.trim()
  if (!name) {
    if (resolvedState.value === 'error') return 'Unable to load content'
    if (resolvedState.value === 'missing') return 'Item not found'
    return 'Nothing here yet'
  }

  const pretty = capitalize(name)
  if (resolvedState.value === 'error')
    return `Unable to load ${name.toLowerCase()}`
  if (resolvedState.value === 'missing') return `${pretty} not found`
  return `No ${name.toLowerCase()} yet`
})

const resolvedDescription = computed(() => {
  if (props.description) return props.description
  if (resolvedState.value === 'error') {
    return 'Something went wrong while loading this content.'
  }
  if (resolvedState.value === 'missing') {
    return 'The requested record is not available.'
  }
  return 'Once records are added, they will display here.'
})

const loadingDescription = computed(() =>
  props.kind === 'document'
    ? 'Hang tight while we look that up.'
    : 'Fetching the latest entries…'
)

const resolvedIcon = computed(() => {
  if (props.icon === null) return null
  if (props.icon) return props.icon
  if (resolvedState.value === 'error') return 'i-lucide-triangle-alert'
  if (resolvedState.value === 'missing') return 'i-lucide-file-question'
  return 'i-lucide-search-x'
})

const showDescription = computed(
  () =>
    (resolvedDescription.value && !showSpinner.value) ||
    hasDescriptionSlot.value ||
    showSpinner.value
)

const bannerDescription = computed(() =>
  showSpinner.value ? loadingDescription.value : resolvedDescription.value
)

const showBannerDescription = computed(
  () => Boolean(bannerDescription.value) || hasDescriptionSlot.value
)

const shouldUppercase = computed(() => props.uppercase ?? isBanner.value)

const cardClass = computed(() => [
  'fx-state-card',
  isBanner.value ? 'fx-state-card--banner' : 'fx-state-card--standard',
  props.surface === 'bare' ? 'fx-state-card--bare' : '',
  `fx-state-card--${resolvedState.value}`,
])

const cardUi = computed(() =>
  props.surface === 'bare' || props.surface === 'collection'
    ? {
        root: 'rounded-none overflow-visible bg-transparent ring-0 divide-y-0 shadow-none',
        body: 'p-0 sm:p-0',
      }
    : undefined
)

const bannerClass = computed(() => ({
  'fx-state-banner--loading': showSpinner.value,
  'fx-state-banner--uppercase': shouldUppercase.value,
}))
</script>

<style scoped>
.fx-state-card {
  width: 100%;
}

.fx-state-card--standard {
  padding: calc(var(--spacing) * 12) 0;
  text-align: center;
}

.fx-state-card__content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: calc(var(--spacing) * 3);
}

.fx-state-card__spinner {
  height: 1.5rem;
  width: 1.5rem;
  animation: spin 1s linear infinite;
  color: var(--ui-primary);
}

.fx-state-card__icon {
  height: 2.5rem;
  width: 2.5rem;
  color: var(--ui-text-dimmed);
}

.fx-state-card__title {
  font-size: var(--text-base);
  font-weight: var(--font-weight-semibold);
  color: var(--ui-text-highlighted);
}

.fx-state-card__description {
  font-size: var(--text-xs);
  color: var(--ui-text-muted);
}

.fx-state-card--bare.fx-state-card--standard {
  padding: calc(var(--spacing) * 6) 0;
}

.fx-state-card--collection.fx-state-card--standard {
  min-height: calc(var(--spacing) * 52);
  padding: calc(var(--spacing) * 8);
  border: 1px dashed color-mix(in srgb, var(--ui-primary) 28%, var(--ui-border));
  border-radius: calc(var(--ui-radius) * 6);
  background: color-mix(in srgb, var(--ui-primary) 3%, var(--ui-bg));
}

.fx-state-card--collection .fx-state-card__content {
  min-height: calc(var(--spacing) * 36);
  justify-content: center;
}

.fx-state-card__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: calc(var(--spacing) * 3);
}

.fx-state-card--error .fx-state-card__icon {
  color: var(--ui-error);
}

.fx-state-banner {
  padding: calc(var(--spacing) * 6);
  text-align: center;
  font-size: var(--text-sm);
  letter-spacing: var(--tracking-widest);
}

.fx-state-banner--uppercase {
  text-transform: uppercase;
}

.fx-state-banner--loading {
  text-transform: none;
  letter-spacing: var(--tracking-normal);
  opacity: 0.7;
}

.fx-state-banner__title {
  margin: 0;
}

.fx-state-banner__description {
  margin: calc(var(--spacing) * 2) 0 0;
  font-size: var(--text-xs);
  letter-spacing: var(--tracking-normal);
  text-transform: none;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
