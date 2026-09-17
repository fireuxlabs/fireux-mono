<template>
  <USkeleton v-if="identity.status.value === 'pending'" class="h-40" />
  <UAlert
    v-else-if="identity.status.value === 'empty'"
    title="No Kitchen selected"
    description="Choose a Kitchen to continue."
  />
  <UAlert
    v-else-if="identity.status.value === 'error'"
    title="Venue identity unavailable"
    description="The Place could not be read. Try loading this page again."
    color="error"
  />
  <UAlert
    v-else-if="identity.status.value === 'missing'"
    title="Place record missing"
    description="This Kitchen’s venue details could not be found."
    color="warning"
  />
  <div v-else class="space-y-6">
    <KitchenEditPublication
      :kitchen="identity.selectedKitchen.value"
      :kitchen-id="identity.kitchenId.value"
      :can-write="identity.canWrite.value"
    />
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 class="text-xl font-semibold">
          {{ identity.fields.value.name || 'Venue details' }}
        </h1>
        <p class="mt-1 text-sm text-muted">
          Venue details and photos are shared with this Kitchen’s Place page.
        </p>
      </div>
      <UButton
        :to="`/places/${encodeURIComponent(identity.placeId.value)}`"
        label="View Place"
        icon="i-lucide-arrow-up-right"
        color="neutral"
        variant="soft"
      />
    </div>
    <PlaceEdit
      v-if="identity.canWrite.value"
      :key="identity.placeId.value"
      :place="identity.place.value"
      :mutation-authority="identity.mutationAuthority.value"
    />
    <UAlert
      v-else
      title="Edit access required"
      description="Editing requires access to this Kitchen."
      color="neutral"
    />
    <UCard>
      <template #header
        ><h2 class="font-semibold">Kitchen settings</h2></template
      >
      <div class="flex flex-wrap items-end justify-between gap-4">
        <KitchenEditCurrency />
        <UButton
          to="/workspace/kitchen/identity/theme"
          label="Kitchen colours"
          icon="i-lucide-palette"
          color="neutral"
          variant="soft"
        />
      </div>
    </UCard>
  </div>
  <PlaceEditIdentity
    ref="editor"
    :place="identity.place.value"
    :can-write="identity.canWrite.value"
    :mutation-authority="identity.mutationAuthority.value"
  />
</template>
<script setup lang="ts">
import { ref } from 'vue'
import PlaceEdit from 'fireux-places/runtime/place/components/Edit.vue'
import PlaceEditIdentity from 'fireux-places/runtime/place/components/Edit/Identity.vue'
import type { KitchenIdentityIntent } from '../../../models/identity-intent'
import type { useKitchenIdentity } from '../../../composables/workspace/identity/useKitchenIdentity'
defineProps<{ identity: ReturnType<typeof useKitchenIdentity> }>()
const editor = ref<InstanceType<typeof PlaceEditIdentity>>()
defineExpose({
  openAction: (intent: KitchenIdentityIntent) => {
    if (intent.action === 'update') editor.value?.show(intent.fields)
  },
})
</script>
