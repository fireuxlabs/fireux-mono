<!-- packages/core/fireux-core/src/runtime/components/App/FireuxAppShell.vue -->
<template>
  <UApp>
    <!-- Toast target -->
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

    <!-- Debug overlay -->
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
import { computed } from 'vue'
import { useHead } from 'nuxt/app'
import { useFireUXConfig } from '../../composables/FireUXConfig'
import { useApp } from '../../composables/app/useApp'

// Names from our FireUX config
const { appName, appShortName } = useFireUXConfig()
const appDisplayName = computed(() => appShortName || appName || 'FireUX')

// Single source of truth: useApp() already exposes isInitialized via useAppComputed(app)
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