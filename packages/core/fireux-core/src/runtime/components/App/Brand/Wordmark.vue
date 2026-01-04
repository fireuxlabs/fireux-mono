<template>
  <ClientOnly>
    <img
      :src="resolvedSrc"
      :alt="resolvedAlt"
      class="fx-brand-wordmark"
      :class="sizeClass"
      loading="lazy"
      decoding="async"
    />
  </ClientOnly>
</template>

<script setup lang="ts">
import { computed } from '#imports'
import { useResolvedColorMode } from '../../../composables/fireux/app/useColorMode'

type BrandSize = 'small' | 'medium' | 'large' | 'hero'

type Variant = 'auto' | 'light' | 'dark'

type Props = {
  size?: BrandSize
  variant?: Variant
  alt?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 'medium',
  variant: 'auto',
  alt: 'App wordmark',
})

const resolvedMode = useResolvedColorMode()
const isDark = computed(() => resolvedMode.value === 'dark')

const resolvedSrc = computed(() => {
  if (props.variant === 'light') return '/img/app/wordmark-light.png'
  if (props.variant === 'dark') return '/img/app/wordmark-dark.png'
  return isDark.value ? '/img/app/wordmark-light.png' : '/img/app/wordmark-dark.png'
})

const resolvedAlt = computed(() => props.alt)

const sizeClass = computed(() => {
  return {
    'fx-brand-wordmark--small': props.size === 'small',
    'fx-brand-wordmark--medium': props.size === 'medium',
    'fx-brand-wordmark--large': props.size === 'large',
    'fx-brand-wordmark--hero': props.size === 'hero',
  }
})
</script>

<style scoped>
.fx-brand-wordmark {
  display: block;
  width: auto;
  object-fit: contain;
  object-position: left center;
}

.fx-brand-wordmark--small {
  height: 2rem;
  max-width: 4rem;
}

.fx-brand-wordmark--medium {
  height: 3rem;
  max-width: 6rem;
}

.fx-brand-wordmark--large {
  height: 4rem;
  max-width: 8rem;
}

.fx-brand-wordmark--hero {
  height: 5rem;
  max-width: 10rem;
}
</style>
