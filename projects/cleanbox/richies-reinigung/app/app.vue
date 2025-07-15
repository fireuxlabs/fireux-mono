<template>
  <UApp>
    <FireAppDebug />
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
        <FireOrganismsAppOnboarding />
      </template>
    </UModal>
  </UApp>
</template>

<script setup>
const { isInitialized } = await useApp()

useHead({
  link: [{ rel: 'manifest', href: '/manifest.webmanifest' }],
})
</script>

<style scoped>
/* No debug styles needed */
</style>
