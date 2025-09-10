<template>
  <UApp>
    <!-- Dev/Debug overlay (always pinned above modal) -->
    <ClientOnly>
      <Teleport to="body">
        <div class="debug-overlay">
          <AppDebug />
        </div>
      </Teleport>
    </ClientOnly>

    <!-- App content -->
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>

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
const { isInitialized } = await useApp()

useHead({
  link: [{ rel: 'manifest', href: '/manifest.webmanifest' }],
})
</script>

<style scoped>
.debug-overlay {
  position: fixed;
  top: 0.75rem;
  right: 0.75rem;
  z-index: 2147483647; /* Above modal */
  pointer-events: auto;
}
</style>
