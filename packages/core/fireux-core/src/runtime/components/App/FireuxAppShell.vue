<!-- packages/core/fireux-core/src/runtime/components/App/FireuxAppShell.vue -->
<template>
  <UApp>
    <!-- Toast target -->
    <ClientOnly>
      <UToaster />
    </ClientOnly>

    <!-- Dev banner (clickable to open dev tools) -->
    <ClientOnly>
      <UBanner
        v-if="isDev"
        class="mb-2 cursor-pointer select-none"
        icon="i-heroicons-wrench-screwdriver"
        color="warning"
        variant="subtle"
        :title="`Welcome to ${appDisplayName} — you are in dev mode`"
        @click="devToolsOpen = true"
      >
        <div class="ml-auto flex items-center gap-2 text-sm opacity-90">
          <UIcon name="i-lucide-hand" />
          <span>Click to open dev tools</span>
        </div>
      </UBanner>
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

    <!-- Dev tools modal -->
    <UModal v-model:open="devToolsOpen" title="Developer Tools">
      <template #body>
        <AppDebug />
      </template>
    </UModal>
  </UApp>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useHead } from 'nuxt/app'
import { useFireUXConfig } from '../../composables/FireUXConfig'
import { useApp } from '../../composables/app/useApp'

// Names from our FireUX config
const { appName, appShortName } = useFireUXConfig()
const appDisplayName = computed(() => appShortName || appName || 'FireUX')
const isDev = !process.dev
const devToolsOpen = ref(false)

// Single source of truth: useApp() already exposes isInitialized via useAppComputed(app)
const { isInitialized } = useApp()

useHead({
  link: [{ rel: 'manifest', href: '/manifest.webmanifest' }],
})
</script>
