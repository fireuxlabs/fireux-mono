<template>
  <UButton
    label="Add station"
    icon="i-lucide-plus"
    :disabled="!kitchenId"
    @click="createOpen = true"
  />
  <UModal
    v-model:open="createOpen"
    title="Add station"
    description="Name a station in this kitchen."
  >
    <template #body><KitchenWorkspacePrepStationsCreate /></template>
  </UModal>
</template>
<script setup lang="ts">
import { useRoute } from '#imports'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { ref, watch } from 'vue'
import KitchenWorkspacePrepStationsCreate from './Create/Index.vue'
import { useKitchenWorkspacePrepStationsRead } from '../../../../composables/workspace/prep/stations/read'

const { kitchenId } = useKitchenWorkspacePrepStationsRead()
const { currentUser } = useAuth()
const route = useRoute()
const createOpen = ref(false)

watch(
  [kitchenId, () => currentUser.value?.uid, () => route.fullPath],
  () => {
    createOpen.value = false
  },
  { flush: 'sync' }
)
</script>
