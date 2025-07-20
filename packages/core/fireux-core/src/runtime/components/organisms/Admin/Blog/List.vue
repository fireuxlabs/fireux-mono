<template>
  <div class="dashboard-widget">
    <h3>All Blogs</h3>
    <!-- <div v-if="blogsCollection && blogsCollection.length">
      <UCard
        v-for="blog in blogsCollection"
        :key="blog.id"
        class="blog-card"
        :ui="{ body: 'flex flex-row items-center justify-between gap-4 p-4' }"
      >
        <div class="blog-info">
          <strong class="blog-title">{{ blog.title }}</strong>
          <p class="blog-summary">{{ blog.summary }}</p>
        </div>
        <OrganismsAdminBlogsActions :blog="blog" />
      </UCard>
    </div>
    <div v-else>
      <p>No blogs found.</p>
    </div> -->
  </div>
</template>

<script setup lang="ts">
// const { blogsCollection } = useAdmin()
</script>

<style scoped>
.dashboard-widget {
  padding: 16px;
}
.blog-card {
  margin-bottom: var(--space-4);
}
.blog-info {
  display: flex;
  flex-direction: column;
}
.blog-title {
  font-weight: var(--font-weight-semibold);
  font-size: 1rem;
}
.blog-summary {
  font-size: 0.875rem;
  color: var(--text-secondary);
}
</style>
