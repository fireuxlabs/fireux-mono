<template>
  <ClientOnly>
    <div v-if="kitchen" class="space-y-6">
      <ConsoleKitchenIdentityEditSectionsSummary
        :kitchen="kitchen"
        :kitchen-id="kitchenId"
        :can-write="canWrite"
      />

      <div class="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div class="space-y-4">
          <ConsoleKitchenIdentityEditSectionsPublicIdentity
            :kitchen="kitchen"
            :kitchen-id="kitchenId"
            :can-write="canWrite"
          />

        </div>

        <ConsoleKitchenIdentityEditSectionsLinks />
      </div>
    </div>

    <MoleculesStateCard v-else entity="kitchen identity" kind="document" loading />
  </ClientOnly>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useKitchenConsoleIdentity } from '../../../../../composables/fireux/console/kitchen/operations/useKitchenConsoleIdentity'

const { selectedKitchen, kitchenId, canWrite } = useKitchenConsoleIdentity()
const kitchen = computed(() => selectedKitchen.value as Record<string, unknown> | null)
</script>
