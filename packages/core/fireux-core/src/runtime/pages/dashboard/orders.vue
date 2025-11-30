<script setup lang="ts">
// Redirect legacy /dashboard/orders to /dashboard/purchases
definePageMeta({ layout: 'dashboard' })
const router = useRouter()
if (process.client) router.replace('/dashboard/purchases')
</script>

<template>
  <UDashboardPanel id="dashboard-orders">
    <template #header>
      <UDashboardNavbar title="Orders">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="p-4 text-sm text-dimmed">Redirecting to Purchases…</div>
    </template>
  </UDashboardPanel>
</template>
