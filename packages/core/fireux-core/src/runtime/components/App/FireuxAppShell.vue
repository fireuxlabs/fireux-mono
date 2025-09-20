<template>
  <UApp>
    <!-- Global notifications (Nuxt UI toast target) -->
    <ClientOnly>
      <UToaster />
    </ClientOnly>

    <!-- Dev banner -->
    <UBanner
      v-if="isDev"
      class="mb-2"
      icon="i-heroicons-wrench-screwdriver"
      color="warning"
      variant="subtle"
      :title="`Welcome to ${appDisplayName} — you are in dev mode`"
    />
    <!-- Dev/Debug overlay (always pinned above modal) -->
    <ClientOnly>
      <Teleport to="body">
        <div class="debug-overlay">
          <AppDebug />
        </div>
      </Teleport>
    </ClientOnly>

    <!-- App content -->
    <UMain>
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </UMain>

    <!-- Blocker until app is initialized -->
    <UModal
      :open="!isInitialized"
      prevent-close
      title="🚫 Blocked"
      description="This app needs to be initialized."
    >
      <template #body>
        <OrganismsAppOnboarding />
      </template>
    </UModal>
  </UApp>
</template>

<script setup lang="ts">
import { useHead, useRuntimeConfig, computed } from '#imports'
import { useApp } from '../../composables/app/useApp'

const { isInitialized } = useApp()
const isDev = process.dev

// Resolve app name from runtimeConfig (prefer short name if present)
const runtimeConfig = useRuntimeConfig()
const appDisplayName = computed(
  () =>
    runtimeConfig.public?.appShortName ||
    runtimeConfig.public?.appName ||
    'FireUX'
)

useHead({
  link: [{ rel: 'manifest', href: '/manifest.webmanifest' }],
})
</script>

<style scoped>
.debug-overlay {
  position: fixed;
  top: 0.75rem;
  right: 0.75rem;
  z-index: 2147483647; /* Above modal */
  pointer-events: auto;
}
</style>
