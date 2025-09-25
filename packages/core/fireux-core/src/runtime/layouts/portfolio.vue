<template>
  <ClientOnly>
    <div>
      <UContainer class="sm:border-x border-default pt-10">
        <LayoutsHeader :menu-bar-links="menuBarLinks" :mobile-links="mobileLinks" />
        <slot />
        <LayoutsDefaultFooter />
      </UContainer>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
const { links } = useCoreRoutes()
const KEEP_MENU = new Set(['home', 'products', 'blog', 'users'])
const KEEP_MOBILE = new Set([...KEEP_MENU, 'user', 'admin'])

const menuBarLinks = computed(() => links.value.filter((r) => KEEP_MENU.has(r.id)))
const mobileLinks = computed(() => links.value.filter((r) => KEEP_MOBILE.has(r.id)))

defineOptions({ name: 'CorePortfolio' })
</script>
