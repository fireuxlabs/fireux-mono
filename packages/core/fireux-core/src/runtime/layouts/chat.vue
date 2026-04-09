<template>
  <ClientOnly>
    <UDashboardGroup unit="rem">
      <LayoutsDefaultHeader
        :menu-bar-links="menuBarLinks"
        :mobile-links="mobileLinks"
      />
      <!-- Leave sidebar/search to chat pages; render page content here -->
      <NuxtPage />
      <LayoutsDefaultFooter />
    </UDashboardGroup>
  </ClientOnly>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useDefaultNav } from '../composables/fireux/app/ui/nav/useDefaultNav'
const nav = useDefaultNav()
const menuBarLinks = computed(() => nav.desktop.value)
const mobileLinks = computed(() => nav.mobile.value)

defineOptions({ name: 'chat' })
</script>
