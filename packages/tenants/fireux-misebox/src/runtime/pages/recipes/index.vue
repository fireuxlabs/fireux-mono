<template>
  <div class="recipes-page">
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold mb-6">Recipes</h1>
      <p class="text-gray-600 mb-8">
        Browse and discover delicious recipes from professional chefs.
      </p>

      <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <!-- Recipe listings will go here -->
        <div class="text-center py-12 col-span-full">
          <p class="text-gray-500">Recipe listings coming soon...</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  title: 'Recipes',
  description: 'Browse and discover delicious recipes from professional chefs',
})
</script>
