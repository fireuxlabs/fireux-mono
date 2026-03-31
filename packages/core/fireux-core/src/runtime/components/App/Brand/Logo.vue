<template>
  <img
    :src="displaySrc"
    :alt="alt"
    class="fx-brand-logo"
    :class="sizeClass"
    loading="lazy"
    decoding="async"
    @error="handleError"
  />
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useFireuxBrandAssets } from '../../../composables/fireux/app/useFireuxBrandAssets'
import { CORE_BRAND_FALLBACK_ASSETS } from '../../../../utils/brandAssets'

type BrandSize = 'small' | 'medium' | 'large' | 'hero'

type Props = {
  size?: BrandSize
  alt?: string
  src?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 'medium',
  alt: 'App logo',
})
const brandAssets = useFireuxBrandAssets()
const resolvedSrc = computed(() => {
  const raw = typeof props.src === 'string' ? props.src.trim() : ''
  return raw || brandAssets.value.logo
})
const failed = ref(false)
const displaySrc = computed(() =>
  failed.value ? CORE_BRAND_FALLBACK_ASSETS.logo : resolvedSrc.value
)

watch(resolvedSrc, () => {
  failed.value = false
})

function handleError() {
  if (displaySrc.value === CORE_BRAND_FALLBACK_ASSETS.logo) return
  failed.value = true
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
