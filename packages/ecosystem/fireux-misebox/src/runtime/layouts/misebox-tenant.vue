<template>
  <main class="misebox-tenant-layout">
    <LayoutsMiseboxTenantHeader />

    <section class="misebox-tenant-layout__body" aria-label="Tenant landing">
      <NuxtPage />
    </section>

    <LayoutsMiseboxTenantFooter />
  </main>
</template>

<script setup lang="ts">
defineOptions({ name: 'misebox-tenant' })
</script>

<style scoped>
.misebox-tenant-layout {
  position: relative;
  isolation: isolate;
  min-height: 100svh;
  overflow: hidden;
  background: var(--brand-ink, #1f1a14);
}

.misebox-tenant-layout__body {
  min-height: 100svh;
}
</style>
