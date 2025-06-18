<template>
  <ClientOnly>
    <div class="layout-wrapper">
      <FireLayoutsHeader :app-links="appLinks" :mobile-links="mobileLinks" />
      <NuxtPage />
      <FireLayoutsDefaultFooter />
    </div>
  </ClientOnly>
</template>

<script setup>
const props = defineProps({
  extras: {
    type: Object,
    default: () => ({}),
  },
})

const { appLinks, mobileLinks } = useRoutes(props.extras)

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
