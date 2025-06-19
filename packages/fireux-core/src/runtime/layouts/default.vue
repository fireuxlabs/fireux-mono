<template>
  <ClientOnly>
    <div class="layout-wrapper">
      <FireLayoutsHeader
        :menu-bar-links="menuBarLinks"
        :mobile-links="mobileLinks"
      />
      <NuxtPage />
      <FireLayoutsDefaultFooter />
    </div>
  </ClientOnly>
</template>

<script setup>
const props = defineProps({
  appLinks: {
    type: Object,
    default: () => ({}),
  },
})

const { menuBarLinks, mobileLinks } = useRoutes(props.appLinks)

defineOptions({
  name: 'CoreDefault',
})
</script>

<style scoped>
.layout-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
}

.layout-wrapper > * {
  align-self: stretch;
}
</style>
