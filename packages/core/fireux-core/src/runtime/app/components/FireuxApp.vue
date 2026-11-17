<template>
  <UApp>
    <ClientOnly>
      <FirePwaStatus />
    </ClientOnly>

    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>

    <DevOnly>
      <AppDevControls />
    </DevOnly>
    <AppInitializationGate />
  </UApp>
</template>
<script setup lang="ts">
import { useAppHead } from '../composables/useAppHead'
import { useAppManifest } from '../composables/useAppManifest'

useAppHead(useAppManifest())
</script>
