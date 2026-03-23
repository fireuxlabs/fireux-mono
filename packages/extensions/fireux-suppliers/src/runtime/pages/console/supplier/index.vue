<template>
  <div />
</template>

<script setup lang="ts">
import { navigateTo } from '#imports'
import { useSupplier } from '../../../composables/supplier/ops/useSupplier'

definePageMeta({
  layout: 'console',
  requiresAuth: true,
})

const { coreSupplier, pending } = useSupplier()

const deadline = Date.now() + 1500
while (pending.value && Date.now() < deadline) {
  await new Promise((resolve) => setTimeout(resolve, 50))
}

if (coreSupplier.value) {
  await navigateTo('/console/supplier/overview', { replace: true })
} else {
  await navigateTo('/console/supplier/create', { replace: true })
}
</script>
