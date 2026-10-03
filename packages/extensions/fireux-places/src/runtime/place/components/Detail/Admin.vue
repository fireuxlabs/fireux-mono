<template>
  <aside v-if="canEdit" class="rounded-xl bg-elevated/50 px-4 py-3 text-sm">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <h2 class="font-semibold">Place management</h2>
      <div class="flex flex-wrap gap-3">
        <UButton
          :to="`/places/${encodeURIComponent(place.id)}/edit`"
          label="Edit identity"
          icon="i-lucide-pencil"
          color="neutral"
          variant="ghost"
        />
      </div>
    </div>
  </aside>
  <DevDebugPanel
    title="Place detail actions"
    context="Viewer authority used to derive the Place management surface."
    object-origin="fetched"
    :objects="{ isAdmin, isDeveloper }"
    :derived="{ canManage }"
    launcher
  />
</template>

<script setup lang="ts">
import { useUserSession } from 'fireux-core/runtime/user/composables/useUserSession'

import { computed } from 'vue'
import type { Place } from '../../models/place.model.ts'
const props = defineProps<{ place: Place }>()
const { currentUser, isAdmin, isDeveloper } = useUserSession()
const canManage = computed(() => isAdmin.value || isDeveloper.value)
const canEdit = computed(
  () =>
    canManage.value ||
    Boolean(
      props.place.claimed_by && props.place.claimed_by === currentUser.value?.id
    )
)
</script>
