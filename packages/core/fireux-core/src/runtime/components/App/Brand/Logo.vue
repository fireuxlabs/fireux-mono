<template>
  <ClientOnly>
    <img
      v-bind="$attrs"
      :src="displaySrc"
      :alt="alt"
      class="fx-brand-logo"
      :class="sizeClass"
      loading="lazy"
      decoding="async"
      @error="handleError"
    />
  </ClientOnly>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useResolvedColorMode } from '../../../composables/fireux/app/useColorMode'
import { useFireuxBrandAssets } from '../../../composables/fireux/app/useFireuxBrandAssets'
import { CORE_BRAND_DEFAULT_ASSETS } from '../../../../utils/brandAssets'

type BrandSize = 'small' | 'medium' | 'large' | 'hero'

type Props = {
  size?: BrandSize
  alt?: string
  src?: string
  lightSrc?: string
  darkSrc?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 'medium',
  alt: 'App logo',
})
const brandAssets = useFireuxBrandAssets()
const resolvedMode = useResolvedColorMode()
const isDark = computed(() => resolvedMode.value === 'dark')
const explicitSrc = computed(() => {
  const raw = typeof props.src === 'string' ? props.src.trim() : ''
  return raw
})
const baseSrc = computed(() => explicitSrc.value || brandAssets.value.logo)
const themedSrc = computed(() => {
  const raw = isDark.value ? props.lightSrc : props.darkSrc
  return typeof raw === 'string' ? raw.trim() : ''
})
const configuredThemedSrc = computed(() => {
  if (explicitSrc.value) return ''
  return isDark.value ? brandAssets.value.logoLight : brandAssets.value.logoDark
})
const resolvedSrc = computed(() =>
  themedSrc.value || configuredThemedSrc.value || baseSrc.value
)
const failedSrcs = ref<string[]>([])
const displaySrc = computed(() => {
  if (!failedSrcs.value.includes(resolvedSrc.value)) return resolvedSrc.value
  if (!failedSrcs.value.includes(baseSrc.value)) return baseSrc.value
  return CORE_BRAND_DEFAULT_ASSETS.logo
})

watch([resolvedSrc, baseSrc], () => {
  failedSrcs.value = []
})

function handleError() {
  if (displaySrc.value === CORE_BRAND_DEFAULT_ASSETS.logo) return
  failedSrcs.value = [...failedSrcs.value, displaySrc.value]
}

const sizeClass = computed(() => ({
  'fx-brand-logo--small': props.size === 'small',
  'fx-brand-logo--medium': props.size === 'medium',
  'fx-brand-logo--large': props.size === 'large',
  'fx-brand-logo--hero': props.size === 'hero',
}))
</script>

<style scoped>
.fx-brand-logo {
  display: block;
  height: auto;
  width: auto;
  object-fit: contain;
}

.fx-brand-logo--small {
  height: 2rem;
  width: 2rem;
}

.fx-brand-logo--medium {
  height: 3rem;
  width: 3rem;
}

.fx-brand-logo--large {
  height: 4rem;
  width: 4rem;
}

.fx-brand-logo--hero {
  height: 5rem;
  width: 5rem;
}
</style>
