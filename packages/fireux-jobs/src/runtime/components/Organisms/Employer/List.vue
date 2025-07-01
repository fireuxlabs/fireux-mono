<template>
  <div v-if="loading" class="text-center py-8">
    <p>Loading employers...</p>
  </div>

  <div
    v-else-if="employers?.length"
    class="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
  >
    <FireOrganismsEmployerCell
      v-for="employer in employers"
      :key="employer.uid"
      :employer="employer"
    />
  </div>

  <div v-else class="text-center py-8">
    <p class="text-gray-600">No employers found.</p>
  </div>
</template>

<script setup>
const props = defineProps({
  employers: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
})
</script>
