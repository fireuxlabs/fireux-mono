<!-- FILE: packages/core/fireux-core/src/runtime/pages/@[handle].vue -->
<template>
  <span aria-hidden="true" style="display: none" />
</template>

<script setup lang="ts">
import { definePageMeta, navigateTo } from '#imports'
import { computed } from 'vue'
import { useRouteParam } from '../composables/shared/useRouteParam'

const handle = useRouteParam('handle')

const target = computed(() =>
  handle.value ? `/users/${encodeURIComponent(handle.value)}` : '/users'
)

definePageMeta({ pageTransition: false })

await navigateTo(target.value, { replace: true })
</script>
