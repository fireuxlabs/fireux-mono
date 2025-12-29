<template>
  <main>
    <p>Hello {{ word }}</p>
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from '#imports'

const route = useRoute()

const word = computed(() => {
  const raw = route.query.word
  const value = Array.isArray(raw) ? String(raw[0] ?? '') : String(raw ?? '')
  return value || 'world'
})
</script>
