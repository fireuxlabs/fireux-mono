<template>
  <UApp>
    <FireOrganismsAppOnboarding />

    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <FireAppDebug />
    <UModal
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

useHead({
  link: [{ rel: 'manifest', href: '/manifest.webmanifest' }],
})

</script>

<style scoped>
/* No debug styles needed */
</style>
