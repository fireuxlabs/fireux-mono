<template>
  <UApp>
    <!-- Injects PWA icons, apple splashscreens, favicons, etc. -->
    <NuxtPwaAssets />
    <ClientOnly>
      <Teleport to="body">
        <div class="debug-overlay">
          <AppDebug />
        </div>
      </Teleport>
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
const isInitialized = true

useHead({
  link: [{ rel: 'manifest', href: '/manifest.webmanifest' }],
})
</script>

<style scoped>
/* Debug overlay pinned above everything (even modals) */
.debug-overlay {
  position: fixed;
  top: 0.75rem;
  right: 0.75rem;
  z-index: 2147483647; /* Max practical z-index */
  pointer-events: auto;
}
</style>
