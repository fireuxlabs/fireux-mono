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

    <p class="landing-hero__paragraph" v-html="systemLine" />
  </div>
</template>

<script setup lang="ts">
const paragraph =
  'Cleanbox is the operating system for cleaning companies and crews. Coordinate schedules, quality checks, and billing from one streamlined console. Keep every service <span class="text-primary">verified</span>, recurring, and client-ready.'

const systemLine =
  'The operating system for repeatable cleaning operations with proof, quality control, and billing discipline.'
</script>
