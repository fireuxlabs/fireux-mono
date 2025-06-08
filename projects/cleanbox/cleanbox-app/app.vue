<template>
  <UApp>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <FireAppDebug />
    <UModal
      v-if="!appInitialized"
      :open="true"
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
const appInitialized = ref(false)

useHead({
  link: [{ rel: 'manifest', href: '/manifest.webmanifest' }],
})
</script>

<style scoped>
/* No debug styles needed */
</style>
