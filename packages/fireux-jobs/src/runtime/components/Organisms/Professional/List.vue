<template>
  <div v-if="loading" class="text-center py-8">
    <p>Loading professionals...</p>
  </div>

  <div
    v-else-if="professionals?.length"
    class="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
  >
    <FireOrganismsProfessionalCell
      v-for="professional in professionals"
      :key="professional.id"
      :professional="professional"
    />
  </div>

  <div v-else class="text-center py-8">
    <p class="text-gray-600">No professionals found.</p>
  </div>
</template>

<script setup>
const props = defineProps({
  professionals: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
})
</script>
