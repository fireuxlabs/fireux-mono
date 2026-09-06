<template>
  <USkeleton v-if="identity.status.value === 'pending'" class="h-40" />
  <UAlert
    v-else-if="identity.status.value === 'empty'"
    title="No Kitchen selected"
    description="Choose or create a Kitchen workspace to begin."
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
    description="This Kitchen’s same-id Place could not be found. Restore its Place record before editing venue identity."
    color="warning"
  />
  <UCard v-else>
    <template #header
      ><div class="flex items-center justify-between gap-3">
        <h2 class="font-semibold">Venue identity</h2>
        <UButton
          label="Edit venue identity"
          :disabled="!identity.canWrite.value"
          @click="editor?.show()"
        /></div
    ></template>
    <div class="grid gap-4 sm:grid-cols-2">
      <div v-for="field in placeIdentityFields" :key="field.key">
        <p class="text-sm text-muted">{{ field.label }}</p>
        <p class="break-words">
          {{ identity.fields.value[field.key] || 'Not set' }}
        </p>
      </div>
    </div>
    <template #footer
      ><UButton
        v-if="identity.place.value"
        :to="`/places/${encodeURIComponent(identity.placeId.value)}/edit`"
        label="Images, opening hours and full Place editor"
        color="neutral"
        variant="soft"
    /></template>
  </UCard>
  <PlaceEditIdentity
    ref="editor"
    :place="identity.place.value"
    :can-write="identity.canWrite.value"
    :mutation-authority="identity.mutationAuthority.value"
  />
</template>
<script setup lang="ts">
import { ref } from 'vue'
import PlaceEditIdentity from 'fireux-places/runtime/place/components/Edit/Identity.vue'
import { placeIdentityFields } from 'fireux-places/runtime/place/models/identity-edit'
import type { KitchenIdentityIntent } from '../../../models/identity-intent'
import type { useKitchenIdentityPage } from '../../../composables/workspace/identity/useKitchenIdentityPage'
defineProps<{ identity: ReturnType<typeof useKitchenIdentityPage> }>()
const editor = ref<InstanceType<typeof PlaceEditIdentity>>()
defineExpose({
  openAction: (intent: KitchenIdentityIntent) => {
    if (intent.action === 'update') editor.value?.show(intent.fields)
  },
})
</script>
