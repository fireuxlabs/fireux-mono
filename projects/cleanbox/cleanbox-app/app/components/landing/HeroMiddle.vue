<template>
  <div class="landing-hero__body">
    <p class="landing-hero__paragraph" v-html="paragraph" />

    <div class="landing-hero__actions">
      <UButton
        size="lg"
        color="primary"
        to="/get-started"
        icon="i-lucide-rocket"
      >
        Get started
      </UButton>

      <UButton
        size="lg"
        variant="outline"
        to="/crews"
        trailing-icon="i-lucide-arrow-right"
      >
        Browse crews
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
const paragraph =
  'Coordinate crews, quality checks, and billing from one console. Cleanbox keeps every service <span class="text-primary">scheduled</span>, <span class="text-primary">verified</span>, and <span class="text-primary">client-ready</span>.'
</script>
