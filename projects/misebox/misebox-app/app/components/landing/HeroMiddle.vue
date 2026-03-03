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
        to="/professionals"
        trailing-icon="i-lucide-arrow-right"
      >
        Browse professionals
      </UButton>
    </div>

    <p class="landing-hero__paragraph" v-html="systemLine" />
  </div>
</template>

<script setup lang="ts">
const paragraph =
  'Misebox is the operating system for kitchens and professionals. Run your <a href="/kitchens"><strong>kitchen</strong></a> from one console - ops, team, and service essentials. When you need staff, publish <a href="/jobs"><strong>roles</strong></a> and connect with <a href="/professionals"><strong>professionals</strong></a> already in the ecosystem.'

const systemLine =
  'One connected console to run service, grow your team, and keep execution tight.'
</script>
