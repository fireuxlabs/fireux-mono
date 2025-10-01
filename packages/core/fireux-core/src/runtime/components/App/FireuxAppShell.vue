<!-- packages/core/fireux-core/src/runtime/components/App/FireuxAppShell.vue -->
<template>
  <UApp>
    <!-- Toast target -->
    <ClientOnly>
      <UToaster />
    </ClientOnly>

    <!-- Dev banner + tools (app-wide, dev only) -->
    <ClientOnly>
      <UBanner
        v-if="isDev"
        class="mb-2"
        icon="i-heroicons-wrench-screwdriver"
        color="warning"
        variant="subtle"
        :title="`Welcome to ${appDisplayName} — you are in dev mode`"
      />
      <div v-if="isDev" class="dev-tools-corner">
        <AppDebug />
      </div>
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
const isDev = process.dev

// Single source of truth: useApp() already exposes isInitialized via useAppComputed(app)
const { isInitialized } = useApp()

useHead({
  link: [{ rel: 'manifest', href: '/manifest.webmanifest' }],
})
</script>

<style scoped>
.dev-tools-corner {
  position: fixed;
  right: 1rem;
  bottom: 1rem;
  z-index: 60;
}
</style>
