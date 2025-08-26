<template>
  <div>
    <UCard>
      <template #header>
        <h1>🧑‍🍳 Fireux-Misebox Package - Chef & Supplier Data</h1>
      </template>
      <p>Package: fireux-misebox</p>
      <p>App: {{ app?.app_name || 'None' }}</p>
      <p>Total Chefs: {{ chefs?.length || 0 }}</p>
      <p>Total Suppliers: {{ suppliers?.length || 0 }}</p>
    </UCard>

    <!-- Chef Components -->
    <UCard v-if="chefs?.length">
      <h2>Chef Components</h2>

      <div v-if="chefs[0]">
        <h3>Chef Pill</h3>
        <MiseProfilesChefCardsPill :chef="chefs[0]" />

        <USeparator />

        <h3>Chef Cell</h3>
        <MiseProfilesChefCardsCell :chef="chefs[0]" />

        <USeparator />

        <h3>Chef Profile Card</h3>
        <MiseProfilesChefCardsProfile :chef="chefs[0]" />
      </div>
    </UCard>

    <!-- Supplier Components -->
    <UCard v-if="suppliers?.length">
      <h2>Supplier Components</h2>

      <div v-if="suppliers[0]">
        <h3>Supplier Pill</h3>
        <MiseProfilesSupplierCardsPill :supplier="suppliers[0]" />

        <USeparator />

        <h3>Supplier Cell</h3>
        <MiseProfilesSupplierCardsCell :supplier="suppliers[0]" />

        <USeparator />

        <h3>Supplier Profile Card</h3>
        <MiseProfilesSupplierCardsProfile :supplier="suppliers[0]" />
      </div>
    </UCard>

    <UCard>
      <div
        style="
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        "
      >
        <h2 style="margin: 0">Chef & Supplier Data JSON</h2>
        <UButton
          icon="i-heroicons-clipboard-document"
          size="sm"
          variant="outline"
          @click="copyToClipboard(jsonSnapshot)"
        >
          Copy
        </UButton>
      </div>
      <pre>{{ jsonSnapshot }}</pre>
    </UCard>

    <UCard v-if="!pending && chefs?.length === 0 && suppliers?.length === 0">
      <div class="text-center py-8">
        <h3>No Chef or Supplier Data Found</h3>
        <p>No chefs found in: apps/{{ app?.id }}/chefs/</p>
        <p>No suppliers found in: apps/{{ app?.id }}/suppliers/</p>
        <p>Try creating some test data in Firestore.</p>
      </div>
    </UCard>
  </div>
</template>

<script setup>
// Use dev layout
definePageMeta({
  layout: 'dev',
  title: 'Misebox Package Dev Tools',
  description: 'Development tools for fireux-misebox package',
})

// Get app information
const { app } = await useApp()

// Get chef data from Firestore
const { data: chefs, pending } = await useAsyncData(
  'package-chefs',
  async () => {
    if (!app.value?.id) return []

    try {
      const db = useFirestore()
      const chefsCollection = collection(db, 'apps', app.value.id, 'chefs')
      const snapshot = await getDocs(chefsCollection)

      return snapshot.docs.map((doc) => ({
        uid: doc.id,
        ...doc.data(),
      }))
    } catch (error) {
      console.error('Error fetching chefs:', error)
      return []
    }
  }
)

// Get supplier data from Firestore
const { data: suppliers } = await useAsyncData(
  'package-suppliers',
  async () => {
    if (!app.value?.id) return []

    try {
      const db = useFirestore()
      const suppliersCollection = collection(
        db,
        'apps',
        app.value.id,
        'suppliers'
      )
      const snapshot = await getDocs(suppliersCollection)

      return snapshot.docs.map((doc) => ({
        uid: doc.id,
        ...doc.data(),
      }))
    } catch (error) {
      console.error('Error fetching suppliers:', error)
      return []
    }
  }
)

// JSON snapshot for copy functionality
const jsonSnapshot = computed(() => {
  return JSON.stringify(
    {
      package: 'fireux-misebox',
      app: app.value,
      chefs: chefs.value,
      suppliers: suppliers.value,
      totalChefs: chefs.value?.length || 0,
      totalSuppliers: suppliers.value?.length || 0,
    },
    null,
    2
  )
})

// Copy to clipboard function
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text)
    console.log('Chef & Supplier data JSON copied to clipboard!')
  } catch (err) {
    console.error('Failed to copy JSON:', err)
  }
}
</script>

<style scoped>
pre {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
}
</style>
