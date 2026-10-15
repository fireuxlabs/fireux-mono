<template>
  <section class="space-y-3">
    <ClientOnly>
      <UCard v-if="!place" variant="subtle">
        <p class="text-sm text-dimmed">Company data unavailable.</p>
      </UCard>

      <div v-else class="space-y-6">
        <PlaceEdit v-if="canEdit" :place="placeForEdit" />
        <UAlert
          v-else
          color="warning"
          variant="soft"
          title="Editing locked"
          description="Company editing is currently available to administrators."
        />
      </div>
    </ClientOnly>
  </section>
</template>

<script setup lang="ts">
import { useUserSession } from 'fireux-core/runtime/user/composables/session/useUserSession'

import type { Place } from 'fireux-places/runtime/place/models/place.model'
import { computed } from 'vue'

const props = defineProps<{ place: Place | null }>()
const place = computed(() => props.place)
const { isAdmin } = useUserSession()
const canEdit = computed(() => Boolean(isAdmin.value))
const placeForEdit = computed<Place | null>(() => place.value)
</script>
