<template>
  <main class="baeren-default-layout">
    <LayoutsMiseboxTenantHeader v-if="!chromeHidden" />

    <section class="baeren-default-layout__body" aria-label="Hotel Bären Ringgenberg">
      <NuxtPage />
    </section>

    <BaerenNav v-if="!chromeHidden" />
    <LayoutsMiseboxTenantFooter v-if="!chromeHidden" />
  </main>
</template>

<script setup lang="ts">
import { useMiseboxTenantChrome } from 'fireux-misebox/runtime/composables/fireux/app/useMiseboxTenantChrome'

defineOptions({ name: 'baeren-default' })

const { chromeHidden } = useMiseboxTenantChrome()
</script>

<style scoped>
.baeren-default-layout {
  position: relative;
  isolation: isolate;
  min-height: 100svh;
  background: var(--baeren-forest);
}

.baeren-default-layout__body {
  min-height: 100svh;
}

:global(.baeren-default-layout .misebox-tenant-header) {
  background: transparent;
}

:global(.baeren-default-layout .misebox-tenant-footer) {
  bottom: calc(5.5rem + env(safe-area-inset-bottom));
}
</style>
