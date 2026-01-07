<template>
  <ClientOnly>
    <img
      v-bind="attrs"
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
import { useAttrs } from 'vue'
import { useFireUXConfig } from '../../../composables/fireux/app/FireUXConfig'
import { useResolvedColorMode } from '../../../composables/fireux/app/useColorMode'

type BrandSize = 'card' | 'small' | 'medium' | 'large' | 'hero'

type Props = {
  size?: BrandSize
  lightSrc?: string
  darkSrc?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 'medium',
})

const attrs = useAttrs()

const cfg = useFireUXConfig()

const resolvedMode = useResolvedColorMode()
const isDark = computed(() => resolvedMode.value === 'dark')

const resolvedSrc = computed(() =>
  isDark.value
    ? (props.darkSrc?.trim() || '/img/app/wordmark-dark.png')
    : (props.lightSrc?.trim() || '/img/app/wordmark-light.png')
)

const resolvedAlt = computed(() => {
  const appName = cfg.appName?.trim()
  return appName ? `${appName} logo` : 'App logo'
})

const sizeClass = computed(() => {
  return {
    'fx-brand-wordmark--card': props.size === 'card',
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
