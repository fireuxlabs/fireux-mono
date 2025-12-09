<template>
  <ClientOnly>
    <UPage>
      <UPageBody class="flex gap-4 items-start">
        <UPageSidebar class="w-64 shrink-0">
          <LayoutsDevNav />
        </UPageSidebar>
        <div class="flex-1 min-w-0">
          <NuxtPage />
        </div>
      </UPageBody>
    </UPage>
  </ClientOnly>
</template>

<script setup lang="ts">
// Dev layout renders the DevNav and the current page; links are read inside DevNav
defineOptions({ name: 'dev' })
</script>
