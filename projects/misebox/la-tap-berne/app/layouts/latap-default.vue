<template>
  <main class="latap-default-layout">
    <LayoutsMiseboxTenantHeader v-if="!chromeHidden" />

    <section class="latap-default-layout__body" aria-label="La Tap Berne">
      <NuxtPage />
    </section>

    <LaTapBerneNav v-if="!chromeHidden" />
    <LayoutsMiseboxTenantFooter v-if="!chromeHidden" />
    <LayoutsSharedRoleBadge />
  </main>
</template>

<script setup lang="ts">
import { useMiseboxTenantChrome } from 'fireux-misebox/runtime/composables/fireux/app/useMiseboxTenantChrome'

defineOptions({ name: 'latap-default' })

const { chromeHidden } = useMiseboxTenantChrome()
</script>

<style scoped>
.latap-default-layout {
  position: relative;
  isolation: isolate;
  min-height: 100svh;
  overflow: hidden;
  background: var(--latap-app-bg, var(--brand-ink, #1f1a14));
}

.latap-default-layout__body {
  min-height: 100svh;
}
</style>
