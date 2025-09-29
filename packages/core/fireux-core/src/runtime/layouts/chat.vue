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

<script setup lang="ts">import { computed } from 'vue'

const { links } = useCoreRoutes()
const KEEP_MENU = new Set(['home', 'products', 'blog', 'users'])
const KEEP_MOBILE = new Set([...KEEP_MENU, 'user', 'admin'])

const menuBarLinks = computed(() =>
  links.value.filter((r) => KEEP_MENU.has(r.id))
)
const mobileLinks = computed(() =>
  links.value.filter((r) => KEEP_MOBILE.has(r.id))
)

defineOptions({ name: 'CoreChat' })
</script>
