<template>
  <div class="fx-layout-shell">
    <LayoutsDefaultHeader />

    <main class="fx-layout-main fx-layout-main--landing">
      <UContainer>
        <NuxtPage />
      </UContainer>
    </main>

    <LayoutsDefaultFooter />
    <LayoutsSharedFloatingChatButton />

    <LayoutsSharedRoleBadge />
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'landing' })
</script>
