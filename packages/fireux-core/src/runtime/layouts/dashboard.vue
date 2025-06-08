<template>
  <ClientOnly>
    <div class="layout-wrapper">
      <LayoutsHeader :app-links="appLinks" :mobile-links="mobileLinks" />
      <div class="layout-content">
        <main class="layout-main-content">
          <UNavigationMenu
            v-if="!isMobile"
            class="mt-[var(--header-height)] w-fit"
            orientation="vertical"
            :items="dashboardLinks"
          />
          <div class="main-section">
            <LayoutsSubHeader :icon-title="subHeader" />
            <NuxtPage />
          </div>
        </main>
      </div>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'
import { computed } from 'vue'
import { useRoutes } from '../composables/utils/useRoutes'

const { width } = useWindowSize()
const isMobile = computed(() => width.value < 1024)

const { appLinks, mobileLinks, dashboardLinks, subHeader } = await useRoutes()
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
  display: flex;
  flex-direction: column;
  flex: 1;
}
</style>
