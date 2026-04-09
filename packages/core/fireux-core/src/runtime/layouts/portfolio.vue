<template>
  <ClientOnly>
    <div>
      <UContainer class="sm:border-x border-default pt-10">
        <LayoutsDefaultHeader
          :menu-bar-links="menuBarLinks"
          :mobile-links="mobileLinks"
        />
        <NuxtPage />
        <LayoutsDefaultFooter />
      </UContainer>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useDefaultNav } from '../composables/fireux/app/ui/nav/useDefaultNav'
const nav = useDefaultNav()
const menuBarLinks = computed(() => nav.desktop.value)
const mobileLinks = computed(() => nav.mobile.value)

defineOptions({ name: 'portfolio' })
</script>
