<template>
  <UCard>
    <UBadge label="Coming soon" color="neutral" variant="soft" />
    <h2 class="fx-type-section-title">{{ name }} tool coming soon</h2>
    <p class="fx-type-caption">
      This Go QR primitive has its page shape ready. The generator tool will
      plug into this space.
    </p>
  </UCard>
</template>

<script setup lang="ts">
defineProps<{
  name: string
}>()
</script>
