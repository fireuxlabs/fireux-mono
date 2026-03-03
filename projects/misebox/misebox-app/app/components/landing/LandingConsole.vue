<template>
  <div v-if="hasConsoleEntry && consoleEntries.length" class="landing-hero__actions">
    <UButton
      v-for="entry in consoleEntries"
      :key="entry.key"
      size="lg"
      variant="subtle"
      color="primary"
      :to="entry.path"
      icon="i-lucide-terminal"
    >
      {{ entry.label }}
    </UButton>
  </div>
</template>

<script setup lang="ts">
import { useConsoleEntryCta } from 'fireux-core/runtime/composables/fireux/app/routing/useConsoleEntryCta'

const { hasConsoleEntry, consoleEntries } = useConsoleEntryCta()
</script>
