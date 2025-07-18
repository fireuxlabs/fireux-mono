<template>
  <ClientOnly>
    <div class="dashboard-page-grid">
      <!-- Blog Create Section -->
      <FireOrganismsBlogCreateSystem class="dashboard-grid-section" />

      <!-- Blog Post Count Section -->
      <!-- <FireOrganismsAdminBlogPostCount class="dashboard-grid-section" :post-count="postCount" /> -->

      <!-- Last Blog Post Section -->
      <!-- <FireOrganismsAdminBlogLastPost class="dashboard-grid-section" :last-post="lastPost" /> -->

      <!-- Blog Link Section -->
      <!-- <FireOrganismsAdminBlogLink class="dashboard-grid-section" /> -->
    </div>
  </ClientOnly>
</template>

<script setup>
import { getRouteMetaForPath } from '../../composables/app/routes/useAppUserRoutes'

const { label, icon } = getRouteMetaForPath('/admin/blog')

definePageMeta({
  layout: 'dashboard',
  layoutProps: {
    dashboardType: 'admin-dashboard',
  },
  title: label,
  icon: icon,
})
</script>

<style scoped>
.dashboard-page-grid {
  column-count: unset !important;
}
</style>
