<template>
  <div class="landing-hero__body">
    <p class="landing-hero__paragraph" v-html="paragraph" />

    <div class="landing-hero__actions">
      <UButton size="lg" color="primary" to="/get-started" icon="i-lucide-rocket">
        Get started
      </UButton>

      <UButton
        size="lg"
        variant="outline"
        to="/projects"
        trailing-icon="i-lucide-arrow-right"
      >
        Browse projects
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
const paragraph =
  'A low-code ecosystem for responsive, scalable, and data-driven applications built upon <span class="text-primary">Nuxt4</span> &amp; <span class="text-primary">Firebase</span>.'
</script>
