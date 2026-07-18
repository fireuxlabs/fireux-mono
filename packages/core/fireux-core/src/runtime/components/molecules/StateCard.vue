<template>
  <UCard :class="cardClass">
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
      />
      <UIcon v-else-if="icon" :name="icon" class="fx-state-card__icon" />
      <p class="fx-state-card__title">
        <slot name="title">{{ resolvedTitle }}</slot>
      </p>
      <p v-if="showDescription" class="fx-state-card__description">
        <slot name="description">
          {{ showSpinner ? loadingDescription : resolvedDescription }}
        </slot>
      </p>
      <slot />
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue'

const props = withDefaults(
  defineProps<{
    entity?: string
    kind?: 'document' | 'collection'
    title?: string
    description?: string
    icon?: string | null
    loading?: boolean
    layout?: 'card' | 'banner'
    uppercase?: boolean
  }>(),
  {
    kind: 'collection',
    icon: 'i-lucide-search-x',
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
const showSpinner = computed(() => props.loading)
const hasDescriptionSlot = computed(() => Boolean(slots.description))
const hasDefaultSlot = computed(() => Boolean(slots.default))

const defaultEntity = computed(() => props.entity?.trim().toLowerCase() ?? '')

const loadingTitle = computed(() => {
  const target = defaultEntity.value
  if (!target) return 'Loading…'
  return `Loading ${target}`
})

const resolvedTitle = computed(() => {
  if (showSpinner.value && !props.title) return loadingTitle.value
  if (props.title) return props.title
  const name = props.entity?.trim()
  if (!name)
    return props.kind === 'document' ? 'Item not found' : 'Nothing here yet'
  const pretty = capitalize(name)
  return props.kind === 'document'
    ? `${pretty} not found`
    : `No ${name.toLowerCase()} yet`
})

const resolvedDescription = computed(() => {
  if (props.description) return props.description
  return props.kind === 'document'
    ? 'We could not load the requested record.'
    : 'Once records are added, they will display here.'
})

const loadingDescription = computed(() =>
  props.kind === 'document'
    ? 'Hang tight while we look that up.'
    : 'Fetching the latest entries…'
)

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

const cardClass = computed(() =>
  isBanner.value
    ? 'fx-state-card fx-state-card--banner'
    : 'fx-state-card fx-state-card--standard'
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
  padding: 3rem 0;
  text-align: center;
}

.fx-state-card__content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
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
  color: rgba(148, 163, 184, 0.8);
}

.fx-state-card__title {
  font-size: 0.95rem;
  font-weight: 600;
  color: rgba(15, 23, 42, 0.85);
}

.fx-state-card__description {
  font-size: 0.8rem;
  color: rgba(100, 116, 139, 0.9);
}

.fx-state-banner {
  padding: 1.5rem;
  text-align: center;
  font-size: 0.875rem;
  letter-spacing: 0.08em;
}

.fx-state-banner--uppercase {
  text-transform: uppercase;
}

.fx-state-banner--loading {
  text-transform: none;
  letter-spacing: normal;
  opacity: 0.7;
}

.fx-state-banner__title {
  margin: 0;
}

.fx-state-banner__description {
  margin: 0.5rem 0 0;
  font-size: 0.75rem;
  letter-spacing: normal;
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
