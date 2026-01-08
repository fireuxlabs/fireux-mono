<template>
  <ClientOnly>
    <img
      v-if="resolvedSrc"
      v-bind="$attrs"
      :src="resolvedSrc"
      :alt="alt"
      class="fx-brand-wordmark"
      :class="`fx-brand-wordmark--${size}`"
      loading="lazy"
      decoding="async"
    />
  </ClientOnly>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useResolvedColorMode } from '../../../composables/fireux/app/useColorMode'

type BrandSize = 'card' | 'small' | 'medium' | 'large' | 'hero'

type Props = {
  size?: BrandSize
  lightSrc?: string
  darkSrc?: string
  alt?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 'medium',
  alt: 'App logo',
})

const size = computed<BrandSize>(() => props.size)

const resolvedMode = useResolvedColorMode()

const isDark = computed(() => resolvedMode.value === 'dark')

const alt = computed(() => (props.alt || '').trim() || 'App logo')

const resolvedSrc = computed(() => {
  const raw = isDark.value ? props.darkSrc : props.lightSrc
  return typeof raw === 'string' ? raw.trim() : ''
})

</script>

<style scoped>
.fx-brand-wordmark {
  display: block;
  width: auto;
  object-fit: contain;
  object-position: left center;
}

.fx-brand-wordmark--card {
  height: 1.5rem;
  max-width: 10rem;
  object-position: right center;
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
