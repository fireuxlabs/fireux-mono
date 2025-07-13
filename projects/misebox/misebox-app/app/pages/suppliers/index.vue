<template>
  <div>
    <h1>Browse Suppliers</h1>
    <p class="mb-6">
      Find reliable suppliers for your kitchen and restaurant needs.
    </p>

    <!-- Supplier list component will go here -->
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <div class="p-6 border rounded-lg">
        <h3 class="font-semibold mb-2">Supplier profiles coming soon</h3>
        <p class="text-gray-600">
          Supplier listings and profiles will be available here.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
// Set page meta
definePageMeta({
  title: 'Browse Suppliers',
  description: 'Find reliable suppliers for your restaurant needs',
})

// Future: Import supplier list component
// import SupplierList from '~/components/organisms/Supplier/List.vue'
</script>
