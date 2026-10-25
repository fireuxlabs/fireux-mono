<template>
  <div class="fx-layout-shell">
    <FireLayoutsDefaultHeader />

    <main class="fx-layout-main fx-layout-main--landing">
      <UContainer>
        <NuxtPage />
      </UContainer>
    </main>

    <FireLayoutsDefaultFooter />
    <FireLayoutsSharedFloatingChatButton />

    <FireLayoutsSharedRoleBadge />
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'landing' })
</script>
