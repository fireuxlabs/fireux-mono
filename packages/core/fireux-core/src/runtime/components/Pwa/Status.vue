<template>
  <section
    v-if="!online || updateAvailable"
    class="border-b border-default bg-elevated py-3 print:hidden"
    role="status"
    aria-live="polite"
    aria-label="Connection and app updates"
  >
    <UContainer class="space-y-3">
      <p v-if="!online" class="text-sm">
        You are offline. Live data and actions need a connection.
      </p>
      <div
        v-if="updateAvailable"
        class="flex flex-wrap items-center justify-between gap-3"
      >
        <p class="text-sm">An update is ready.</p>
        <div class="flex flex-wrap gap-2">
          <UButton
            label="Update and reload"
            size="sm"
            :disabled="busy"
            @click="applyUpdate"
          />
          <UButton
            label="Later"
            size="sm"
            color="neutral"
            variant="ghost"
            :disabled="busy"
            @click="dismissUpdate"
          />
        </div>
      </div>
      <div v-if="error" class="flex flex-wrap items-center gap-2" role="alert">
        <p class="break-words text-sm text-error">{{ error }}</p>
        <FireCopyError :message="error" />
      </div>
    </UContainer>
  </section>
</template>

<script setup lang="ts">
import { usePwa } from '../../composables/pwa/usePwa'

const { online, updateAvailable, busy, error, applyUpdate, dismissUpdate } =
  usePwa()
</script>
