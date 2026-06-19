<template>
  <main class="latap-default-layout">
    <LayoutsMiseboxTenantHeader />

    <section class="latap-default-layout__body" aria-label="La Tap Berne">
      <slot />
    </section>

    <LaTapBerneNav v-if="!chromeHidden" />
    <LayoutsMiseboxTenantFooter />
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
  background: var(--brand-ink, #1f1a14);
}

.latap-default-layout__body {
  min-height: 100svh;
}
</style>
