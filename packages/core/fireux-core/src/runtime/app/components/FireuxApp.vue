<template>
  <UApp>
    <ClientOnly>
      <FirePwaStatus />
    </ClientOnly>

    <slot>
      <NuxtLayout>
        <UMain>
          <NuxtPage />
        </UMain>
      </NuxtLayout>
    </slot>

    <DevOnly>
      <AppDevControls />
    </DevOnly>
    <AppInitializationGate />
  </UApp>
</template>
<script setup lang="ts">
import { useAppHead } from '../composables/useAppHead'

const props = withDefaults(defineProps<{ manifestPath?: string }>(), {
  manifestPath: '/manifest.webmanifest',
})

useAppHead(() => props.manifestPath)
</script>
