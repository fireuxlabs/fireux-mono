<template>
  <ClientOnly>
    <NuxtLink to="/" class="logo-link">
      <AppBrandWordmark :size="size" class="logo" />
    </NuxtLink>
  </ClientOnly>
</template>

<script setup lang="ts">
type BrandSize = 'small' | 'medium' | 'large' | 'hero'
const props = withDefaults(defineProps<{ size?: BrandSize }>(), {
  size: 'medium',
})

const size = props.size
</script>

<style scoped>
.logo-link {
  display: inline-block;
  width: fit-content;
  height: fit-content;
}

.logo {
  object-fit: contain;
  display: block;
}
</style>
