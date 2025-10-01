<template>
  <div class="layout-wrapper">
    <LayoutsDefaultHeader />

    <main class="layout-main">
      <UContainer>
        <NuxtPage />
      </UContainer>
    </main>

    <LayoutsDefaultFooter />
  </div>
</template>

<script setup lang="ts"></script>

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
