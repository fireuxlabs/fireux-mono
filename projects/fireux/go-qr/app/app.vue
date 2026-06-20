<template>
  <UApp v-if="isToolRoute">
    <NuxtPage />
  </UApp>
  <AppShell v-else />
</template>

<script setup lang="ts">
import { useRoute } from '#imports'
import { computed } from 'vue'

const route = useRoute()
const isToolRoute = computed(() => route.path.startsWith('/tools/'))
</script>
