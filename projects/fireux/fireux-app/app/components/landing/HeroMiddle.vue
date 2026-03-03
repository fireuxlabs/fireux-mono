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

    <p class="landing-hero__paragraph" v-html="systemLine" />
  </div>
</template>

<script setup lang="ts">
const paragraph =
  'FireUX is the console architecture for builders and operators. A low-code ecosystem for responsive, scalable, and data-driven applications built upon <a href="/developer/technologies"><strong>Nuxt 4</strong></a> &amp; <a href="/developer/technologies"><strong>Firebase</strong></a>.'

const systemLine =
  'The operating system for building and running domain applications from one shared, extensible core.'
</script>
