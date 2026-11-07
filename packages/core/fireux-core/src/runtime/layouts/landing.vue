<template>
  <div class="fx-layout-shell">
    <FireLayoutsDefaultHeader />

    <div class="fx-layout-main fx-layout-main--landing">
      <UContainer>
        <slot />
      </UContainer>
    </div>

    <FireLayoutsDefaultFooter />
    <FireLayoutsSharedFloatingChatButton />

    <FireLayoutsSharedRoleBadge />
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'landing' })
</script>
