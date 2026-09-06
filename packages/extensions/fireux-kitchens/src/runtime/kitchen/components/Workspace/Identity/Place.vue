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

  <UAlert v-else-if="!pending" title="Place record missing" description="Restore the same-id Place before editing its venue details." color="warning" />
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
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useKitchenWorkspacePlace } from '../../../composables/workspace/identity/useKitchenWorkspacePlace'

const { appId } = useFireUXConfig()
const { kitchenId, placeId, canWrite, place, pending } =
  useKitchenWorkspacePlace()
const mutationAuthority = computed(() => ({
  appId,
  kitchenId: kitchenId.value,
}))
</script>
