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
import { useNavDefault } from '../composables/app/nav/useNavDefault'
const nav = useNavDefault()
const menuBarLinks = computed(() => nav.desktop.value)
const mobileLinks = computed(() => nav.mobile.value)

defineOptions({ name: 'CorePortfolio' })
</script>
