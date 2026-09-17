<template>
  <ClientOnly>
    <div v-if="kitchen && outcome === 'ready'" class="space-y-6">
      <KitchenEditPublication
        :kitchen="kitchen"
        :kitchen-id="kitchenId"
        :can-write="canWrite"
      />
      <UCard>
        <template #header
          ><h2 class="font-semibold">Kitchen colours</h2></template
        >
        <UButton
          color="neutral"
          variant="soft"
          icon="i-lucide-palette"
          to="/workspace/kitchen/identity/theme"
          label="Edit colours"
        />
      </UCard>
    </div>
    <UAlert v-else-if="!kitchenId" title="No Kitchen selected" />
    <UAlert
      v-else-if="outcome === 'error'"
      color="error"
      title="Kitchen identity unavailable"
    />
    <UAlert v-else-if="outcome === 'missing'" title="Kitchen unavailable" />
    <MoleculesStateCard
      v-else
      entity="kitchen identity"
      kind="document"
      loading
    />
  </ClientOnly>
</template>

<script setup lang="ts">
import { useKitchenWorkspaceIdentity } from '../../../../composables/workspace/identity/useKitchenWorkspaceIdentity'
const {
  selectedKitchen: kitchen,
  outcome,
  kitchenId,
  canWrite,
} = useKitchenWorkspaceIdentity()
</script>
