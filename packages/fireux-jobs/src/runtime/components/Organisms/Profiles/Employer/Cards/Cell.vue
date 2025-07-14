<template>
  <UCard
    class="cursor-pointer hover:shadow-lg transition-all duration-200"
    @click="navigateTo(`/employers/${employer.id}`)"
  >
    <div class="text-center space-y-4">
      <UAvatar
        :src="employer.avatarUrl"
        :alt="employer.company_name"
        size="xl"
        :text="getInitials(employer.company_name)"
      />

      <div>
        <h3 class="font-semibold text-lg">
          {{ employer.company_name }}
        </h3>
        <p v-if="employer.title" class="text-gray-600 text-sm">
          {{ employer.title }}
        </p>
      </div>

      <p v-if="employer.bio_short" class="text-gray-700 text-sm line-clamp-2">
        {{ employer.bio_short }}
      </p>

      <div
        v-if="employer.specialties?.length"
        class="flex flex-wrap gap-1 justify-center"
      >
        <UBadge
          v-for="specialty in employer.specialties.slice(0, 3)"
          :key="specialty"
          variant="soft"
          size="sm"
        >
          {{ specialty }}
        </UBadge>
        <UBadge
          v-if="employer.specialties.length > 3"
          variant="outline"
          size="sm"
        >
          +{{ employer.specialties.length - 3 }} more
        </UBadge>
      </div>
    </div>
  </UCard>
</template>

<script setup>
// Props from parent
const props = defineProps({
  employer: {
    type: Object,
    required: true,
  },
})

// Get initials for avatar fallback
function getInitials(name) {
  if (!name) return 'E'
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
