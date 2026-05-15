<template>
  <FindmyseoPreflightBanner v-if="showPreflightBanner" />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const route = useRoute()
const showPreflightBanner = computed(() => !route.path.startsWith('/dashboard'))
</script>
