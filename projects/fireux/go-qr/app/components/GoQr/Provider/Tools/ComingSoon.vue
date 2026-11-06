<template>
  <div
    class="max-w-xl rounded-md border border-dashed border-default bg-muted/20 p-5"
  >
    <UBadge label="Coming soon" color="neutral" variant="soft" />
    <h2 class="mt-4 fx-type-section-title">{{ name }} tool coming soon</h2>
    <p class="mt-2 fx-type-caption">
      This Go QR primitive has its page shape ready. The generator tool will
      plug into this space.
    </p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  name: string
}>()
</script>
