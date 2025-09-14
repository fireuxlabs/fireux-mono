<template>
  <div class="user-metrics">
    <UCard>
      <template #default>
        <h3>Total Users</h3>
        <div>
          <p>{{ totalUsers }}</p>
        </div>
      </template>
    </UCard>
    <!-- Placeholder for future active users metric -->
  </div>
</template>

<script setup lang="ts">
const { totalUsers } = await useAdminMetrics()
</script>

<style scoped>
.user-metrics {
  display: grid;
  gap: 1rem;
}
</style>
