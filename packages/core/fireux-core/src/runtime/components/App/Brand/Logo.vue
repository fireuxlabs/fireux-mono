<template>
  <img
    src="/img/app/logo.png"
    :alt="alt"
    class="fx-brand-logo"
    :class="sizeClass"
    loading="lazy"
    decoding="async"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'

type BrandSize = 'small' | 'medium' | 'large' | 'hero'

type Props = {
  size?: BrandSize
  alt?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 'medium',
  alt: 'App logo',
})

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
