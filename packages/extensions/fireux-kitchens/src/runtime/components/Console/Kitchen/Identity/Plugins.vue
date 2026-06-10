<template>
  <ClientOnly>
    <div v-if="selectedKitchen" class="space-y-6">
      <UCard variant="subtle">
        <div class="flex items-start gap-3">
          <UIcon name="i-lucide-plug" class="mt-1 size-5 shrink-0 text-muted" />
          <div>
            <h2 class="text-2xl font-semibold text-highlighted">
              Plugins
            </h2>
            <p class="text-sm text-dimmed">
              Optional tools for this kitchen.
            </p>
          </div>
        </div>
      </UCard>

      <UCard>
        <div class="flex items-start gap-3">
          <UIcon name="i-lucide-puzzle" class="mt-1 size-5 shrink-0 text-muted" />
          <div>
            <h3 class="text-base font-semibold text-highlighted">
              No kitchen plugins yet
            </h3>
            <p class="text-sm text-dimmed">
              Optional tools can be added here once they have their own package layer.
            </p>
          </div>
        </div>
      </UCard>
    </div>

    <MoleculesStateCard v-else entity="kitchen plugins" kind="document" loading />
  </ClientOnly>
</template>

<script setup lang="ts">
import { useKitchenConsoleIdentity } from '../../../../composables/fireux/console/kitchen/Identity/useKitchenConsoleIdentity'

const {
  selectedKitchen,
} = useKitchenConsoleIdentity()
</script>
