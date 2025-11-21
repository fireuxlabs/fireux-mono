<template>
  <div class="space-y-6">
    <UCard>
      <template #header>
        <h2>{{ resolvedTitle }}</h2>
      </template>

      <div class="space-y-4">
        <slot />
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  title?: string
}>()

const resolvedTitle = computed(() => props.title ?? 'Profile')
</script>
