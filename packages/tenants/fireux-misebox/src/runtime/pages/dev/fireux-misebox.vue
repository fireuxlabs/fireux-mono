<template>
  <div>
    <UCard>
      <template #header>
        <h1>🍳 Global Chefs Collection</h1>
      </template>
      <p>Total Global Chefs: {{ globalChefs?.length || 0 }}</p>
      <DevJson
        :data="{ total: globalChefs?.length || 0, chefs: globalChefs }"
        title="Global Chefs JSON"
      />
    </UCard>

    <div style="margin-top: 16px; display: grid; gap: 16px">
      <UCard>
        <template #header>
          <h2>👤 Current Chef (global)</h2>
        </template>
        <DevJson
          :data="profile.current?.global || null"
          title="Current Global Chef"
        />
      </UCard>
    </div>

    <UCard style="margin-top: 16px">
      <template #header>
        <h1>🚚 Global Suppliers Collection</h1>
      </template>
      <p>Total Global Suppliers: {{ globalSuppliers?.length || 0 }}</p>
      <DevJson
        :data="{
          total: globalSuppliers?.length || 0,
          suppliers: globalSuppliers,
        }"
        title="Global Suppliers JSON"
      />
    </UCard>

    <div style="margin-top: 16px; display: grid; gap: 16px">
      <UCard>
        <template #header>
          <h2>👤 Current Supplier (global)</h2>
        </template>
        <DevJson
          :data="supplierProfile.current?.global || null"
          title="Current Global Supplier"
        />
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
