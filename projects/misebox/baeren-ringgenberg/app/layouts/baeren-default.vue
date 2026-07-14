<template>
  <main class="baeren-default-layout">
    <LayoutsMiseboxTenantHeader v-if="!chromeHidden" />

    <section class="baeren-default-layout__body" aria-label="Hotel Bären Ringgenberg">
      <NuxtPage />
    </section>

    <BaerenRinggenbergNav v-if="!chromeHidden" />
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
  overflow: hidden;
  background: var(--baeren-app-bg, var(--brand-ink, #1f1a14));
}

.baeren-default-layout__body {
  min-height: 100svh;
}
</style>
