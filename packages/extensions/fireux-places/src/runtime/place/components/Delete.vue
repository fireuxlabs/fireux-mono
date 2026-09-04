<!-- Concurrent edit — 2026-07-22 12:58 CEST — Place detail deletion: give developers and App admins a guarded destructive action. -->
<template>
  <UPageCard
    v-if="canDelete"
    title="Delete place"
    description="Permanently remove this place when no other entity uses it."
    variant="subtle"
  >
    <UButton
      color="error"
      variant="soft"
      icon="i-lucide-trash-2"
      :loading="deleting"
      @click="requestDelete"
    >
      Delete place
    </UButton>
  </UPageCard>
</template>

<script setup lang="ts">
import { navigateTo } from '#imports'
import { useDeveloperAccess } from 'fireux-core/runtime/app/composables/useDeveloperAccess'
import { useToastify } from 'fireux-core/runtime/composables/ui/useToastify'
import { useUser } from 'fireux-core/runtime/user/composables/useUser'
import { computed, onMounted, ref } from 'vue'
import type { Place } from '../models/place.model.ts'
import { usePlaceDelete } from '../composables/firestore/mutations/usePlaceDelete'

const props = defineProps<{
  place: Place
}>()

const { isAdmin } = useUserSession()
const { isDeveloper } = useDeveloperAccess()
const { deletePlace } = usePlaceDelete()
const toast = useToastify()
const deleting = ref(false)
const mounted = ref(false)
const canDelete = computed(
  () => mounted.value && (isDeveloper.value || isAdmin.value)
)

onMounted(() => {
  mounted.value = true
})

async function requestDelete() {
  if (!canDelete.value || deleting.value) return
  const confirmed = window.confirm(
    `Delete "${props.place.name}"?\n\nThis cannot be undone. Linked entities will block deletion.`
  )
  if (!confirmed) return

  deleting.value = true
  try {
    await deletePlace(props.place.id)
    toast.success('Place deleted')
    await navigateTo('/places')
  } catch (error: any) {
    const message = String(
      error?.data?.statusMessage || error?.statusMessage || error?.message || 'Please try again.'
    )
    toast.error(`Place could not be deleted: ${message}`)
  } finally {
    deleting.value = false
  }
}
</script>
