<template>
  <div v-if="canManage" class="flex flex-wrap gap-3">
    <UButton
      :to="`/places/${encodeURIComponent(place.id)}/edit`"
      label="Edit Place"
      icon="i-lucide-pencil"
      color="neutral"
      variant="soft"
    />
    <PlaceDelete :place="place" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useUser } from 'fireux-core/runtime/user/composables/useUser'
import type { Place } from '../../models/place.model.ts'
defineProps<{ place: Place }>()
const { isAdmin, isDeveloper } = useUser()
const canManage = computed(() => isAdmin.value || isDeveloper.value)
</script>
