<template>
  <div v-if="place" class="space-y-4">
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
        :to="`/places/${encodeURIComponent(placeId)}/edit`"
      >
        Full Place editor
      </UButton>
    </div>

    <PlaceEditBackdrop
      :place="place"
      :mutation-authority="mutationAuthority"
      :can-write="canWrite"
    />
  </div>

  <MoleculesStateCard
    v-else
    entity="linked Place"
    kind="document"
    surface="bare"
    :loading="pending"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useKitchenConsolePlace } from '../../../composables/console/identity/useKitchenConsolePlace'

const { appId, kitchenId, placeId, canWrite, place, pending } = useKitchenConsolePlace()
const mutationAuthority = computed(() => ({
  appId: appId.value,
  kitchenId: kitchenId.value,
}))
</script>
