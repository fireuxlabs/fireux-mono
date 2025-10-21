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
import { useNavDefault } from '../composables/fireUX/nav/useNavDefault'
const nav = useNavDefault()
const menuBarLinks = computed(() => nav.desktop.value)
const mobileLinks = computed(() => nav.mobile.value)

defineOptions({ name: 'CoreChat' })
</script>
