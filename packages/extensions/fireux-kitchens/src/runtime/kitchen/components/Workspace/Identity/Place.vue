<template>
  <div v-if="status === 'ready' && place" class="space-y-4">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div>
        <p class="font-medium text-highlighted">{{ place.name || placeId }}</p>
        <p class="text-sm text-dimmed">
          {{ place.short_address || place.formatted_address || placeId }}
        </p>
      </div>
      <UButton
        size="xs"
        color="neutral"
        variant="soft"
        icon="i-lucide-map-pin"
        :to="`/places/${encodeURIComponent(placeId)}`"
      >
        View Place
      </UButton>
    </div>

    <PlaceEdit
      v-if="canWrite"
      :key="placeId"
      :place="place"
      :mutation-authority="mutationAuthority"
    />
    <UAlert v-else title="Edit access required" color="neutral" />
  </div>

  <MoleculesStateCard
    v-else-if="status === 'error'"
    entity="linked Place"
    kind="document"
    surface="bare"
    state="error"
  />
  <UAlert
    v-else-if="status === 'empty'"
    title="No Kitchen selected"
    description="Choose a Kitchen to continue."
    color="neutral"
  />
  <UAlert
    v-else-if="status === 'missing'"
    title="Place record missing"
    description="Restore the same-id Place before editing its venue details."
    color="warning"
  />
  <MoleculesStateCard
    v-else
    entity="linked Place"
    kind="document"
    surface="bare"
    loading
  />
  <ClientOnly>
    <DevDebugPanel v-bind="debug" title="Venue identity debug" class="mt-6" />
  </ClientOnly>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from '#imports'
import { defineDevDebugPayload } from 'fireux-core/runtime/types/dev-debug'
import {
  identityKitchenDebug,
  identityPlaceDebug,
  identityPresenceDebug,
} from '../../../utils/identity-debug'
import { useKitchenIdentity } from '../../../composables/workspace/identity/useKitchenIdentity'

const {
  kitchenId,
  placeId,
  canWrite,
  place,
  pending,
  selectedKitchen,
  outcome,
  placeOutcome,
  status,
  mutationAuthority,
} = useKitchenIdentity()
const route = useRoute()
const debug = computed(() =>
  defineDevDebugPayload({
    objectOrigin: 'fetched',
    objects: {
      kitchen: identityKitchenDebug(selectedKitchen.value),
      place: identityPlaceDebug(place.value),
    },
    derived: {
      route: route.path,
      kitchenId: kitchenId.value,
      placeId: placeId.value,
      reads: { kitchen: outcome.value, place: placeOutcome.value },
      pending: pending.value,
      canWrite: canWrite.value,
      present: identityPresenceDebug(place.value),
    },
  })
)
</script>
