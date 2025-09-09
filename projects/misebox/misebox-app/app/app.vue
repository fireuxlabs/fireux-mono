<template>
  <UApp>
    <AppDev />

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

const isInitialized = ref(true)

onMounted(async () => {
  const { isInitialized: init } = await useApp()
  isInitialized.value = init.value
})

useHead({
  link: [{ rel: 'manifest', href: '/manifest.webmanifest' }],
})
</script>

<style scoped>
/* No debug styles needed */
</style>
