<template>
  <ClientOnly>
    <div class="layout-wrapper">
      <FireLayoutsHeader :menu-bar-links="routes" :mobile-links="routes" />
      <div class="layout-content">
        <main class="layout-main-content">
          <UNavigationMenu
            v-if="!isMobile"
            class="mt-[var(--header-height)] w-fit"
            orientation="vertical"
            :items="routes"
          />
          <div class="main-section">
            <!-- <FireLayoutsSubHeader :icon-title="subHeader" /> -->
            <NuxtPage />
          </div>
        </main>
      </div>
      <FireLayoutsDefaultFooter />
    </div>
  </ClientOnly>
</template>

<script setup>
import { useWindowSize } from '@vueuse/core'
import { computed } from 'vue'

const props = defineProps({
  routes: {
    type: Array,
    default: () => [],
  },
})

const { width } = useWindowSize()
const isMobile = computed(() => width.value < 1024)

defineOptions({
  name: 'CoreDashboard',
})
</script>

<style scoped>
.layout-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.layout-content {
  display: flex;
  flex-direction: column;
  max-width: 1800px;
  width: 100%;
}
.layout-main-content {
  padding: var(--space-4);
  display: flex;
  flex-direction: row;
  align-items: start;
}
.main-section {
  flex: 1;
  width: 100%;
}
</style>
