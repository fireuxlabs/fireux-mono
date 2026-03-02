<template>
  <div class="landing-hero__body">
    <p class="landing-hero__paragraph" v-html="paragraph" />

    <div class="landing-hero__actions">
      <UButton
        size="lg"
        color="primary"
        to="/get-started"
      >
        Get started
      </UButton>

      <UButton
        size="lg"
        variant="outline"
        to="/crews"
        trailing-icon="i-lucide-arrow-right"
      >
        Explore crews
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
  'Coordinate crews, quality checks, and billing from one console. Cleanbox keeps every service <span class="text-primary">scheduled</span>, <span class="text-primary">verified</span>, and <span class="text-primary">client-ready</span>.'

const { hasConsoleEntry } = useConsoleEntryCta()
</script>
