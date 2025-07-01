<template>
  <div v-if="loading" class="text-center py-8">
    <p>Loading users...</p>
  </div>

  <div
    v-else-if="users?.length"
    class="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
  >
    <FireOrganismsUserCell v-for="user in users" :key="user.uid" :user="user" />
  </div>

  <div v-else class="text-center py-8">
    <p class="text-gray-600">No users found.</p>
  </div>
</template>

<script setup>
const props = defineProps({
  users: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
})
</script>
