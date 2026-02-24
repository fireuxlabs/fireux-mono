<template>
  <div class="landing-hero__body">
    <p class="landing-hero__paragraph" v-html="paragraph" />

    <div class="landing-hero__actions">
      <UButton
        size="lg"
        color="primary"
        to="/kitchens"
      >
        Open kitchens
      </UButton>

      <UButton
        size="lg"
        variant="outline"
        to="/professionals"
        trailing-icon="i-lucide-arrow-right"
      >
        Browse professionals
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
const paragraph =
  'Run your <a href="/kitchens"><strong>kitchen</strong></a> from one dashboard - ops, team, and service essentials. When you need staff, publish <a href="/jobs"><strong>roles</strong></a> and connect with <a href="/professionals"><strong>professionals</strong></a> already in the ecosystem.'
</script>
