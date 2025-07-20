<template>
  <div class="misebox-dashboard">
    <FireLayoutsHeader
      :menu-bar-links="menuBarLinks"
      :mobile-links="mobileLinks"
    />
    <main class="dashboard-content">
      <NuxtPage />
    </main>
    <FireLayoutsDefaultFooter />
  </div>
</template>

<script setup>
import { getCoreRoutes } from '../../../../../core/fireux-core/src/runtime/composables/app/routes/useCoreRoutes'
import { getMiseboxRoutes } from '../composables/app/routes/useMiseboxRoutes'

const { appUser } = await useAppUser()

// Get routes
const { menuBarLinks: coreMenuBarLinks, mobileLinks: coreMobileLinks } = await getCoreRoutes()
const miseboxRoutes = appUser ? getMiseboxRoutes() || [] : []

// Combine routes
const menuBarLinks = [...coreMenuBarLinks, ...miseboxRoutes]
const mobileLinks = [...coreMobileLinks, ...miseboxRoutes]
</script>

<style scoped>
.misebox-dashboard {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.dashboard-content {
  flex: 1;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

@media (max-width: 768px) {
  .dashboard-content {
    padding: 1rem;
  }
}
</style>