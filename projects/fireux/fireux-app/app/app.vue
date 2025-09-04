<template>
  <UApp>
    <ClientOnly>
      <AppDebug />
    </ClientOnly>

    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>

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

<script setup>
const { isInitialized } = await useApp()
const runtime = useRuntimeConfig()

// Server log at init
if (import.meta.server) {
  console.log('🔥 runtimeConfig.public (server)', runtime.public)
  console.log(
    '🔥 runtimeConfig.public (server:json)',
    JSON.stringify(runtime.public)
  )
}

// Client log after hydration
if (import.meta.client) {
  console.log('🔥 runtimeConfig.public (client)', runtime.public)
  console.log(
    '🔥 runtimeConfig.public (client:json)',
    JSON.stringify(runtime.public)
  )
}

useHead({
  link: [{ rel: 'manifest', href: '/manifest.webmanifest' }],
})
</script>

<style scoped>
/* No debug styles needed */
</style>
