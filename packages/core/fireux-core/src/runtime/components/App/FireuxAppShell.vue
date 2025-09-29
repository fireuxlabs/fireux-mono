<!-- packages/core/fireux-core/src/runtime/components/App/FireuxAppShell.vue -->
<template>
  <UApp>
    <!-- Toast target -->
    <ClientOnly>
      <UToaster />
    </ClientOnly>

    <!-- Debug banner and tools are now scoped to the landing layout only -->

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

useHead({
  link: [{ rel: 'manifest', href: '/manifest.webmanifest' }],
})
</script>
