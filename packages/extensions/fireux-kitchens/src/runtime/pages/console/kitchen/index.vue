<template>
  <div class="flex min-h-[40vh] items-center justify-center px-4">
    <div class="text-center">
      <p class="text-sm text-dimmed">{{ statusMessage }}</p>
      <p v-if="errorMessage" class="mt-2 text-xs text-red-500">
        {{ errorMessage }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { navigateTo, useRoute } from '#imports'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { computed, ref, watch } from 'vue'
import { useRuntimeKitchenSelection } from '../../../composables/fireux/app/kitchen-runtime/state'
import { useChefCreate } from '../../../composables/fireux/firestore/profiles/Chef/main/useChefCreate'

definePageMeta({
  layout: 'console',
  requiresAuth: true,
})

const route = useRoute()
const { firestoreFetchCollection } = useFirestoreRead()
const { ensureChefProfile } = useChefCreate()
const kitchens = firestoreFetchCollection<{ id?: string }>('kitchens')
const { runtimeKitchenId, setRuntimeKitchen } = useRuntimeKitchenSelection()
const isNavigating = ref(false)
const errorMessage = ref('')

const statusMessage = computed(() => {
  if (errorMessage.value) return 'Unable to resolve kitchen console.'
  if (kitchens.value === undefined) return 'Loading kitchens...'
  return 'Opening kitchen console...'
})

watch(
  () => kitchens.value,
  async (liveKitchens) => {
    if (liveKitchens === undefined || isNavigating.value || errorMessage.value) return

    isNavigating.value = true

    try {
      await ensureChefProfile()
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error ?? '')
      if (message.includes('[ensure] Missing authenticated user')) {
        await navigateTo(`/auth?redirect=${encodeURIComponent(route.fullPath)}`, { replace: true })
        return
      }

      errorMessage.value = message || 'Failed to resolve chef profile.'
      isNavigating.value = false
      return
    }

    const selectedId = String(runtimeKitchenId.value || '').trim()
    const fallbackId = String(liveKitchens[0]?.id || '').trim()
    const resolvedId = liveKitchens.some((entry) => String(entry?.id || '').trim() === selectedId)
      ? selectedId
      : fallbackId

    if (!resolvedId) {
      await navigateTo('/console/kitchen/create', { replace: true })
      return
    }

    setRuntimeKitchen({ kitchenId: resolvedId, mode: 'live' })
    await navigateTo('/console/kitchen/overview', { replace: true })
  },
  { immediate: true }
)
</script>
