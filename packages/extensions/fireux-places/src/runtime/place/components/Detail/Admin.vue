<template>
  <aside v-if="canEdit">
    <div>
      <h2 class="fx-type-section-title">Place management</h2>
      <div>
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
  <FireDiagnosticsDebugPanel
    title="Place detail actions"
    context="Viewer authority used to derive the Place management surface."
    object-origin="fetched"
    :objects="{ isAdmin, isDeveloper }"
    :derived="{ canManage }"
    launcher
  />
</template>

<script setup lang="ts">
import { useUserSession } from 'fireux-core/runtime/user/composables/session/useUserSession'

import { computed } from 'vue'
import type { Place } from '../../models/place.model.ts'
const props = defineProps<{ place: Place }>()
const { user, isAdmin, isDeveloper } = useUserSession()
const canManage = computed(() => isAdmin.value || isDeveloper.value)
const canEdit = computed(
  () =>
    canManage.value ||
    Boolean(props.place.claimed_by && props.place.claimed_by === user.value?.id)
)
</script>
