<template>
  <div class="layout-container">
    <FireLayoutsHeader :app-links="appLinks" :mobile-links="mobileLinks" />
    <div class="layout-content">
      <main class="layout-main-content">
        <client-only>
          <!-- <UBreadcrumb :links="breadcrumbLinks" class="layout-breadcrumbs" /> -->
        </client-only>
        <NuxtPage />
      </main>
    </div>
    <FireLayoutsDefaultFooter />
  </div>
</template>

<script setup>
// const breadcrumbLinks = useBreadcrumbs()
const { appLinks, mobileLinks } = useRoutes()

defineOptions({
  name: 'CoreDefault',
})
</script>

<style scoped>
.layout-container {
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
  flex-direction: column;
  align-items: start;
}
</style>
