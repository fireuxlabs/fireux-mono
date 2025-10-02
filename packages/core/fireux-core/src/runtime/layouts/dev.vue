<template>
  <ClientOnly>
    <UPage>
      <UPageBody class="flex gap-4 items-start">
        <UPageSidebar class="w-64 shrink-0">
          <LayoutsDevNav />
        </UPageSidebar>
        <UPageMain class="flex-1 min-w-0">
          <NuxtPage />
        </UPageMain>
      </UPageBody>
    </UPage>
  </ClientOnly>
</template>

<script setup lang="ts">
// Dev layout renders the DevNav and the current page; links are read inside DevNav
defineOptions({ name: 'CoreDev' })
</script>
