<template>
  <div />
</template>

<script setup lang="ts">
import { navigateTo, useRoute } from '#imports'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { useChefCreate } from '../../../composables/fireux/firestore/profiles/Chef/main/useChefCreate'
import { useRuntimeKitchenSelection } from '../../../composables/fireux/app/kitchen-runtime/state'

definePageMeta({
  layout: 'kitchen-console',
  requiresAuth: true,
})

const route = useRoute()
const { firestoreFetchCollection } = useFirestoreRead()
const { ensureChefProfile } = useChefCreate()
const kitchens = firestoreFetchCollection<{ id?: string }>('kitchens')
const { runtimeKitchenId, setRuntimeKitchen } = useRuntimeKitchenSelection()

const deadline = Date.now() + 1500
while (kitchens.value === undefined && Date.now() < deadline) {
  await new Promise((resolve) => setTimeout(resolve, 50))
}

try {
  await ensureChefProfile()
} catch (error) {
  const message = error instanceof Error ? error.message : String(error ?? '')
  if (message.includes('[ensure] Missing authenticated user')) {
    await navigateTo(`/auth?redirect=${encodeURIComponent(route.fullPath)}`, { replace: true })
  } else {
    throw error
  }
}

const liveKitchens = kitchens.value ?? []
const selectedId = String(runtimeKitchenId.value || '').trim()
const fallbackId = String(liveKitchens[0]?.id || '').trim()
const resolvedId =
  liveKitchens.some((entry) => String(entry?.id || '').trim() === selectedId)
    ? selectedId
    : fallbackId

if (!resolvedId) {
  await navigateTo('/console/kitchen/create', { replace: true })
} else {
  setRuntimeKitchen({ kitchenId: resolvedId, mode: 'live' })
  await navigateTo('/console/kitchen/overview', { replace: true })
}
</script>
