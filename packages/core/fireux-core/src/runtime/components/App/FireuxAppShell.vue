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
    >
      Development mode
    </UBanner>
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
import { useHead } from '#imports'
import { useApp } from '../../composables/app/useApp'

const { isInitialized } = useApp()
const isDev = process.dev

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
