<!-- FILE: packages/extensions/fireux-places/src/runtime/components/organisms/entities/Place/CTA.vue -->
<template>
  <UPageCTA
    title="Create a place"
    description="Search a place, confirm it, and store the canonical record for this runtime."
    variant="naked"
  >
    <!-- section consumer -->
    <template #default>
      <PlaceSearchSection
        :type="type"
        @confirmed="emit('confirmed')"
      />
    </template>
  </UPageCTA>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    type?: string | null
  }>(),
  {
    type: null,
  }
)

const emit = defineEmits<{
  (e: 'confirmed'): void
}>()
</script>
