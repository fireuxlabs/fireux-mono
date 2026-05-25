<template>
  <section class="space-y-4">
    <UCard :ui="{ body: 'space-y-4' }">
      <template #header>
        <div class="space-y-1">
          <div class="font-medium">Select a place</div>
          <div class="text-sm text-dimmed">
            Confirm the canonical place record so other entities can reuse the same location truth.
          </div>
        </div>
      </template>

      <PlaceSearchSection
        :type="type"
        :placeholder="placeholder"
        @confirmed="onConfirmed"
      />

      <UAlert
        color="neutral"
        variant="soft"
        icon="i-lucide-info"
        title="Canonical place"
        description="This flow confirms the shared place record. Public entities and consoles can layer on top of it later."
      />
    </UCard>
  </section>
</template>

<script setup lang="ts">
import type { PlaceUpsertInput } from '../../../models/place.model'

withDefaults(
  defineProps<{
    type?: string | null
    placeholder?: string | null
  }>(),
  {
    type: null,
    placeholder: null,
  }
)

const emit = defineEmits<{
  (e: 'created', payload: { id: string; place: PlaceUpsertInput }): void
}>()

function onConfirmed(payload: { placeId: string; place: PlaceUpsertInput }) {
  emit('created', {
    id: payload.placeId,
    place: payload.place,
  })
}
</script>
