<template>
  <div class="kitchens-page">
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold mb-6">Kitchens</h1>
      <p class="text-gray-600 mb-8">
        Discover professional kitchens and culinary spaces in your area.
      </p>

      <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <!-- Kitchen listings will go here -->
        <div class="text-center py-12 col-span-full">
          <p class="text-gray-500">Kitchen listings coming soon...</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  title: 'Kitchens',
  description: 'Discover professional kitchens and culinary spaces',
})
</script>
