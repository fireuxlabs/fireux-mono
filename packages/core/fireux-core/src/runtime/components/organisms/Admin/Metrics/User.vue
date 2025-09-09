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
    <UCard>
      <template #default>
        <h3>Active Users</h3>
        <div>
          <p>{{ activeUsers }}</p>
        </div>
      </template>
    </UCard>
  </div>
</template>

<script setup lang="ts">
const { totalUsers, activeUsers } = useUserMetrics()
</script>

<style scoped>
.user-metrics {
  display: grid;
  gap: 1rem;
}
</style>
