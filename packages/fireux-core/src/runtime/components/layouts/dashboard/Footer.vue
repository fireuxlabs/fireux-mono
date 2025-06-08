<!-- COMMENT: app/components/layouts/dashboard/Footer.vue -->
<template>
  <footer class="dashboard-footer">
    <p>&copy; {{ new Date().getFullYear() }} FIReUX. All rights reserved.</p>
  </footer>
</template>

<style scoped>
.dashboard-footer {
  width: 100%;
  padding: 1rem;
  text-align: center;
  background-color: var(--background-2);
  color: var(--text-secondary);
}
</style>