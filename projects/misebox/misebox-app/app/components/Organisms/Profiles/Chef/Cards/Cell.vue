<template>
  <UCard
    class="cursor-pointer hover:shadow-lg transition-all duration-200"
    @click="navigateTo(`/chefs/${chef.id}`)"
  >
    <div class="text-center space-y-4">
      <UAvatar
        :src="chef.avatarUrl"
        :alt="chef.chef_name"
        size="xl"
        :text="getInitials(chef.chef_name)"
      />

      <div>
        <h3 class="font-semibold text-lg">
          {{ chef.chef_name }}
        </h3>
        <p v-if="chef.title" class="text-gray-600 text-sm">
          {{ chef.title }}
        </p>
      </div>

      <p v-if="chef.bio_short" class="text-gray-700 text-sm line-clamp-2">
        {{ chef.bio_short }}
      </p>

      <div
        v-if="chef.specialties?.length"
        class="flex flex-wrap gap-1 justify-center"
      >
        <UBadge
          v-for="specialty in chef.specialties.slice(0, 3)"
          :key="specialty"
          variant="soft"
          size="sm"
        >
          {{ specialty }}
        </UBadge>
        <UBadge v-if="chef.specialties.length > 3" variant="outline" size="sm">
          +{{ chef.specialties.length - 3 }} more
        </UBadge>
      </div>
    </div>
  </UCard>
</template>

<script setup>
// Props from parent
const props = defineProps({
  chef: {
    type: Object,
    required: true,
  },
})

// Get initials for avatar fallback
function getInitials(name) {
  if (!name) return 'C'
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}
</script>

<style scoped>
/* Let NuxtUI handle all the styling */
</style>
