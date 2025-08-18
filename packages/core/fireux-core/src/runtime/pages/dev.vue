<template>
  <div class="dev-nav-page">
    <h1>🧪 Development Pages</h1>

    <div class="nav-section">
      <h2>📄 Available Dev Pages</h2>

      <div class="nav-cards">
        <NuxtLink to="/dev/core-users" class="nav-link">
          <UCard class="nav-card">
            <h3>Core Users</h3>
            <p>View and test core user components</p>
          </UCard>
        </NuxtLink>

        <NuxtLink to="/dev/app-users" class="nav-link">
          <UCard class="nav-card">
            <h3>App Users</h3>
            <p>View and manage app user data</p>
          </UCard>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Simple dev navigation page
</script>

<style scoped>
.dev-nav-page {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

.nav-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.nav-link {
  text-decoration: none;
  display: block;
}

.nav-card {
  cursor: pointer;
  transition: transform 0.2s ease;
}

.nav-card:hover {
  transform: translateY(-2px);
}

.nav-card h3 {
  margin: 0 0 0.5rem 0;
  color: rgb(var(--color-primary-500));
}

.nav-card p {
  margin: 0;
  color: rgb(var(--color-gray-600));
}
</style>
