<!-- packages/core/fireux-core/src/runtime/components/App/FireuxAppShell.vue -->
<template>
  <UApp>
    <!-- Toast target -->
    <ClientOnly>
      <UToaster />
    </ClientOnly>

    <!-- Tiny dev icon (top-center) to open dev tools route -->
    <ClientOnly>
      <div
        v-if="isDev"
        class="fixed top-1/2 right-4 -translate-y-1/2 z-[9999] select-none"
      >
        <UTooltip text="Open dev tools" :popper="{ placement: 'bottom' }">
          <UButton
            aria-label="Open dev tools"
            size="xs"
            variant="ghost"
            color="neutral"
            icon="i-heroicons-wrench-screwdriver"
            class="opacity-70 hover:opacity-100"
            @click="goToDev()"
          />
        </UTooltip>
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
import { useRouter } from 'vue-router'
import { useHead } from 'nuxt/app'
import { useApp } from '../../composables/firestore/core/app/useApp'
import { useAppComputed } from '../../composables/firestore/core/app/useAppComputed'

const isDev = import.meta.dev
const router = useRouter()

const { app } = useApp()
const appComputed = useAppComputed(app)
const isInitialized = appComputed.isInitialized ?? computed(() => false)

useHead({
  link: [{ rel: 'manifest', href: '/manifest.webmanifest' }],
})

function goToDev() {
  router.push('/dev')
}
</script>
