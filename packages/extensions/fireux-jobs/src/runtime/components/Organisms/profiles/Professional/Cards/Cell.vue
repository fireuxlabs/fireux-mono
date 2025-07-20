<template>
  <UCard
    class="cursor-pointer hover:shadow-lg transition-all duration-200"
    @click="navigateTo(`/professionals/${professional.id}`)"
  >
    <div class="text-center space-y-4">
      <UAvatar
        :src="professional.avatarUrl"
        :alt="professional.professional_name"
        size="xl"
        :text="getInitials(professional.professional_name)"
      />

      <div>
        <h3 class="font-semibold text-lg">
          {{ professional.professional_name }}
        </h3>
        <p v-if="professional.title" class="text-gray-600 text-sm">
          {{ professional.title }}
        </p>
      </div>

      <p
        v-if="professional.bio_short"
        class="text-gray-700 text-sm line-clamp-2"
      >
        {{ professional.bio_short }}
      </p>

      <div
        v-if="professional.specialties?.length"
        class="flex flex-wrap gap-1 justify-center"
      >
        <UBadge
          v-for="specialty in professional.specialties.slice(0, 3)"
          :key="specialty"
          variant="soft"
          size="sm"
        >
          {{ specialty }}
        </UBadge>
        <UBadge
          v-if="professional.specialties.length > 3"
          variant="outline"
          size="sm"
        >
          +{{ professional.specialties.length - 3 }} more
        </UBadge>
      </div>
    </div>
  </UCard>
</template>

<script setup>
// Props from parent
const props = defineProps({
  professional: {
    type: Object,
    required: true,
  },
})

// Get initials for avatar fallback
function getInitials(name) {
  if (!name) return 'P'
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
