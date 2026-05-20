<!-- FILE: packages/core/fireux-core/src/runtime/pages/@[handle].vue -->
<template>
  <span aria-hidden="true" style="display: none" />
</template>

<script setup lang="ts">
import { definePageMeta, navigateTo } from '#imports'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

definePageMeta({
  tenant: 'global',
})

const route = useRoute()

const handle = computed(() => {
  const raw = Array.isArray(route.params.handle)
    ? route.params.handle[0]
    : route.params.handle
  return String(raw ?? '').trim()
})

const target = computed(() =>
  handle.value ? `/users/${encodeURIComponent(handle.value)}` : '/users'
)

await navigateTo(target.value, { replace: true })
</script>
