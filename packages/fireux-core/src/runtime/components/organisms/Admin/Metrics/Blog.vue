<template>
  <div class="blog-metrics">
    <UCard>
      <template #default>
        <h3>Total Blog Posts</h3>
        <div>
          <p>{{ totalPosts }}</p>
        </div>
      </template>
    </UCard>
    <UCard>
      <template #default>
        <h3>Article Posts</h3>
        <div>
          <p>{{ articlePosts }}</p>
        </div>
      </template>
    </UCard>
    <UCard>
      <template #default>
        <h3>Product Posts</h3>
        <div>
          <p>{{ productPosts }}</p>
        </div>
      </template>
    </UCard>
  </div>
</template>

<script setup lang="ts">
const { totalPosts, articlePosts, productPosts } = useAdminMetrics()
</script>

<style scoped>
.blog-metrics {
  display: grid;
  gap: 1rem;
}
</style>