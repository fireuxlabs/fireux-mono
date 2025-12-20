<!-- FILE: packages/core/fireux-core/src/runtime/components/App/Shell.vue -->
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
    <!-- ClientOnly prevents SSR mismatch / initial flash.
          isInitialized now flips false while the app payload loads. -->
    <ClientOnly>
      <UModal
        :open="!isInitialized"
        prevent-close
        title="🚫 Blocked"
        description="This app needs to be initialized."
      >
        <template #body>
          <AppOnboarding />
        </template>
      </UModal>
    </ClientOnly>
  </UApp>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useHead } from '#imports'
import { useApp } from '../../composables/fireux/firestore/core/app/useApp.ts'

const isDev = import.meta.dev
const router = useRouter()

const isInitialized = import.meta.client ? useApp().isInitialized : true

useHead({
  link: [{ rel: 'manifest', href: '/manifest.webmanifest' }],
})

function goToDev() {
  router.push('/dev')
}
</script>
