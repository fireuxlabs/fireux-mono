<template>
  <UPageCTA
    title="Create a place"
    description="Search, confirm, then store a canonical place for this runtime."
    variant="naked"
  >
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
