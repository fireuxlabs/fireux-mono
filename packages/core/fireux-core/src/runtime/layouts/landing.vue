<template>
  <div class="layout-wrapper">
    <LayoutsDefaultHeader />

    <main class="layout-main">
      <UContainer>
        <LayoutsSharedBreadcrumbs class="mb-4" />
        <NuxtPage />
      </UContainer>
    </main>

    <LayoutsDefaultFooter />
    <LayoutsSharedFloatingChatButton />
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'landing' })
</script>

<style scoped>
.layout-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
.layout-main {
  flex: 1;
  padding-block: var(--spacing-m);
}
</style>
