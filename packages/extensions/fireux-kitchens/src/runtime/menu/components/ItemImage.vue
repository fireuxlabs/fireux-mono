<template>
  <img
    v-if="visibleUrl"
    :src="visibleUrl"
    alt=""
    width="80"
    height="80"
    class="menu-item-image"
    loading="lazy"
    decoding="async"
    @error="failedUrl = visibleUrl"
  />
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

const props = defineProps<{ enabled?: boolean; imageUrl?: string }>()
const failedUrl = ref('')
const visibleUrl = computed(() => {
  const url = String(props.imageUrl || '').trim()
  return props.enabled === true && url && url !== failedUrl.value ? url : ''
})
watch(
  () => props.imageUrl,
  () => {
    failedUrl.value = ''
  }
)
</script>

<style scoped>
.menu-item-image {
  display: block;
  width: var(--menu-item-image-size, 5rem);
  height: var(--menu-item-image-size, 5rem);
  flex: none;
  border-radius: calc(var(--ui-radius) * 3);
  object-fit: cover;
}
</style>
