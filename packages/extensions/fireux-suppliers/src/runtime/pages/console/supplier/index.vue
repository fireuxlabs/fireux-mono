<template>
  <div />
</template>

<script setup lang="ts">
import { navigateTo } from '#imports'
import { useRuntimeSupplier } from '../../../composables/fireux/app/supplier-console/useRuntimeSupplier'

definePageMeta({
  layout: 'console',
  requiresAuth: true,
})

const runtime = useRuntimeSupplier()

const deadline = Date.now() + 1500
while (runtime.pending.value && Date.now() < deadline) {
  await new Promise((resolve) => setTimeout(resolve, 50))
}

if (runtime.doc.value) {
  await navigateTo('/console/supplier/overview', { replace: true })
} else {
  await navigateTo('/console/supplier/create', { replace: true })
}
</script>
