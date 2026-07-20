<template>
  <UCard>
    <template #header>
      <div class="console-card-header">
        <div class="console-card-header__title">Linked Place</div>
        <p class="console-card-header__description">
          Place is shared location truth. Changes here update the linked Place record.
        </p>
      </div>
    </template>

    <div v-if="!placeId" class="space-y-2">
      <p class="text-sm text-dimmed">
        This kitchen is not linked to a Place yet.
      </p>
    </div>

    <MoleculesStateCard
      v-else-if="pending"
      entity="linked place"
      kind="document"
      surface="bare"
      loading
    />

    <UAlert
      v-else-if="!place"
      color="warning"
      variant="soft"
      title="Linked Place not found"
      :description="`Kitchen points to Place ${placeId}, but that record is not available.`"
    />

    <div v-else class="space-y-4">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="min-w-0">
          <div class="truncate text-sm font-medium text-highlighted">
            {{ place.name || placeId }}
          </div>
          <p class="truncate text-xs text-dimmed">
            {{ place.formatted_address || place.short_address || placeId }}
          </p>
        </div>

        <UButton
          size="xs"
          variant="soft"
          color="neutral"
          icon="i-lucide-map-pin"
          :to="canWrite ? `/places/${encodeURIComponent(placeId)}/edit` : undefined"
          :disabled="!canWrite"
        >
          Full Place editor
        </UButton>
      </div>

      <PlaceEdit
        v-if="canWrite"
        :place="place"
        :mutation-authority="mutationAuthority"
      />
      <UAlert
        v-else
        color="neutral"
        variant="soft"
        icon="i-lucide-eye"
        title="Read-only Place preview"
        description="Demo data cannot update the shared Place record."
      />
    </div>
  </UCard>
</template>

<script setup lang="ts">
// Concurrent edit — 2026-07-20 21:17 CEST — Place-root authority pass: bind Place edits to the explicit selected App/Kitchen authority.
import { computed } from 'vue'
import { useKitchenConsolePlace } from '../../../../composables/fireux/console/kitchen/identity/useKitchenConsolePlace'

const { appId, kitchenId, placeId, canWrite, place, pending } = useKitchenConsolePlace()
const mutationAuthority = computed(() => ({
  appId: appId.value,
  kitchenId: kitchenId.value,
}))
</script>
