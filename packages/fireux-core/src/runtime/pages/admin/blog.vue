<template>
  <ClientOnly>
    <div class="dashboard-page-grid">
      <!-- Blog Create Section -->
      <OrganismsBlogCreateSystem class="dashboard-grid-section" />

      <!-- Blog Post Count Section -->
      <!-- <OrganismsAdminBlogPostCount class="dashboard-grid-section" :post-count="postCount" /> -->

      <!-- Last Blog Post Section -->
      <!-- <OrganismsAdminBlogLastPost class="dashboard-grid-section" :last-post="lastPost" /> -->

      <!-- Blog Link Section -->
      <!-- <OrganismsAdminBlogLink class="dashboard-grid-section" /> -->
    </div>
  </ClientOnly>
</template>

<script setup>
import { getRouteMetaForPath } from '../../composables/utils/useRoutes'

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
