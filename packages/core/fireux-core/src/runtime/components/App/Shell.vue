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
        class="fixed top-1/2 right-4 -translate-y-1/2 z-[2147483647] select-none"
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
    <!-- Render only after app doc resolves.
         This avoids a brief modal flash while the app payload is still loading. -->
    <ClientOnly>
      <UModal
        v-if="showOnboardingModal"
        :open="showOnboardingModal"
        prevent-close
        title="🚫 Blocked"
        description="This app needs to be initialized."
      >
        <template #body>
          <AppCreateSystem />
        </template>
      </UModal>
    </ClientOnly>
  </UApp>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useHead } from '#imports'
import { useApp } from '../../composables/fireux/firestore/core/app/useApp'

const isDev = import.meta.dev
const router = useRouter()

const { isResolved, isInitialized } = import.meta.client
  ? useApp()
  : ({
      isResolved: computed(() => false),
      isInitialized: computed(() => true),
    } as const)

const showOnboardingModal = computed(
  () => isResolved.value && !isInitialized.value
)

useHead({
  link: [{ rel: 'manifest', href: '/manifest.webmanifest' }],
})

function goToDev() {
  router.push('/dev')
}
</script>
