<template>
  <div>
    <h1>Browse Chefs</h1>
    <p class="mb-6">Discover talented chefs available for hire.</p>

    <!-- Chef list component will go here -->
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <div class="p-6 border rounded-lg">
        <h3 class="font-semibold mb-2">Chef profiles coming soon</h3>
        <p class="text-gray-600">
          Chef listings and profiles will be available here.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
// Set page meta
definePageMeta({
  title: 'Browse Chefs',
  description: 'Find talented chefs for your kitchen needs',
})

// Future: Import chef list component
// import ChefList from '~/components/organisms/Chef/List.vue'
</script>
