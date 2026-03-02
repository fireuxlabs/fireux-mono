<template>
  <div class="landing-hero__body">
    <p class="landing-hero__paragraph" v-html="paragraph" />

    <div class="landing-hero__actions">
      <UButton size="lg" color="primary" to="/get-started">
        Get started
      </UButton>

      <UButton
        size="lg"
        variant="outline"
        to="/projects"
        trailing-icon="i-lucide-arrow-right"
      >
        Explore projects
      </UButton>

      <UButton
        v-if="hasConsoleEntry"
        size="lg"
        variant="soft"
        color="neutral"
        to="/console"
        icon="i-lucide-terminal"
      >
        Go to console
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useConsoleEntryCta } from 'fireux-core/runtime/composables/fireux/app/routing/useConsoleEntryCta'
const paragraph =
  'A low-code ecosystem for responsive, scalable, and data-driven applications built upon <span class="text-primary">Nuxt4</span> &amp; <span class="text-primary">Firebase</span>.'

const { hasConsoleEntry } = useConsoleEntryCta()
</script>
