///Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/tenants/fireux-misebox/src/runtime/pages/dev/fireux-misebox.vue
<template>
  <div>
    <UCard>
      <template #header>
        <h1>🍳 Global Chefs Collection</h1>
      </template>
      <p>Total Global Chefs: {{ globalChefs?.length || 0 }}</p>
      <DevJsonPanel
        :data="{ total: globalChefs?.length || 0, chefs: globalChefs }"
      />
    </UCard>

    <div style="margin-top: 16px; display: grid; gap: 16px">
      <UCard>
        <template #header>
          <h2>👤 Current Chef (global)</h2>
        </template>
        <DevJsonPanel :data="profile.current?.global || null" />
      </UCard>
    </div>

    <UCard style="margin-top: 16px">
      <template #header>
        <h1>🚚 Global Suppliers Collection</h1>
      </template>
      <p>Total Global Suppliers: {{ globalSuppliers?.length || 0 }}</p>
      <DevJsonPanel
        :data="{
          total: globalSuppliers?.length || 0,
          suppliers: globalSuppliers,
        }"
      />
    </UCard>

    <div style="margin-top: 16px; display: grid; gap: 16px">
      <UCard>
        <template #header>
          <h2>👤 Current Supplier (global)</h2>
        </template>
        <DevJsonPanel :data="supplierProfile.current?.global || null" />
      </UCard>
    </div>
  </div>
</template>

<script setup>
// Read-only global view using the unified profile composable
import { ref, onMounted } from 'vue'
import { chefConfig } from '../../models/profiles/Chef.model'
import { supplierConfig } from '../../models/profiles/Supplier.model'
definePageMeta({
  layout: 'dev',
  alias: ['/dev/fireux-misebox-tennant'],
  nav: {
    key: 'dev-tenant-misebox-global',
    label: 'Misebox Global',
    icon: 'i-lucide-globe-2',
    desktop: true,
    group: 'misebox',
    layouts: ['dev'],
  },
})

// Use the useProfile composable to fetch global chefs
const profile = useProfile(chefConfig)
onMounted(() => {
  // Ensure global list is loaded in both roles
  profile.collection?.fetchGlobal?.()
})
// Ref of the global collection array; fallback to empty ref for SSR safety
const globalChefs = profile.collection?.fetchGlobal?.() ?? ref([])

// Suppliers: mirror the same pattern for global view
const supplierProfile = useProfile(supplierConfig)
onMounted(() => {
  supplierProfile.collection?.fetchGlobal?.()
})
const globalSuppliers = supplierProfile.collection?.fetchGlobal?.() ?? ref([])
</script>
