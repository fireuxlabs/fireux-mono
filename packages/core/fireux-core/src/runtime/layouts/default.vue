<!-- packages/core/fireux-core/src/runtime/layouts/default.vue -->
<template>
  <div class="layout-wrapper">
    <div class="layout-atmosphere" aria-hidden="true">
      <div class="layout-orb layout-orb--amber" />
      <div class="layout-orb layout-orb--sand" />
      <div class="layout-grid" />
    </div>

    <LayoutsDefaultHeader />

    <main class="layout-main">
      <UContainer class="layout-container">
        <NuxtPage />
      </UContainer>
    </main>

    <LayoutsDefaultFooter />
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'default' })
</script>

<style scoped>
.layout-wrapper {
  position: relative;
  isolation: isolate;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background:
    radial-gradient(circle at top left, rgb(250 204 21 / 0.18), transparent 28rem),
    radial-gradient(circle at top right, rgb(251 191 36 / 0.12), transparent 24rem),
    linear-gradient(180deg, rgb(255 252 245 / 0.96), rgb(255 255 255 / 1) 22rem);
}

.layout-atmosphere {
  position: absolute;
  inset: 0;
  overflow: clip;
  pointer-events: none;
  z-index: -1;
}

.layout-orb {
  position: absolute;
  border-radius: 9999px;
  filter: blur(72px);
  opacity: 0.55;
}

.layout-orb--amber {
  top: -5rem;
  left: -4rem;
  width: 18rem;
  height: 18rem;
  background: rgb(251 191 36 / 0.24);
}

.layout-orb--sand {
  top: 10rem;
  right: -5rem;
  width: 20rem;
  height: 20rem;
  background: rgb(245 158 11 / 0.16);
}

.layout-grid {
  position: absolute;
  inset-inline: 0;
  top: 0;
  height: 24rem;
  background-image:
    linear-gradient(to right, rgb(113 113 122 / 0.06) 1px, transparent 1px),
    linear-gradient(to bottom, rgb(113 113 122 / 0.06) 1px, transparent 1px);
  background-size: 2.75rem 2.75rem;
  mask-image: linear-gradient(180deg, rgb(0 0 0 / 0.75), transparent);
}

.layout-main {
  flex: 1;
  position: relative;
  padding-block: clamp(1.25rem, 3vw, 2.5rem) clamp(4rem, 8vw, 6rem);
}

.layout-container {
  position: relative;
}
</style>
