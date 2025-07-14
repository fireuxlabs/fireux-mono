<template>
  <UCard
    class="cursor-pointer hover:shadow-lg transition-all duration-200"
    @click="navigateTo(`/suppliers/${supplier.id}`)"
  >
    <div class="text-center space-y-4">
      <UAvatar
        :src="supplier.avatarUrl"
        :alt="supplier.business_name"
        size="xl"
        :text="getInitials(supplier.business_name)"
      />

      <div>
        <h3 class="font-semibold text-lg">
          {{ supplier.business_name }}
        </h3>
        <p v-if="supplier.business_type" class="text-gray-600 text-sm">
          {{ supplier.business_type }}
        </p>
      </div>

      <p v-if="supplier.bio_short" class="text-gray-700 text-sm line-clamp-2">
        {{ supplier.bio_short }}
      </p>

      <div
        v-if="supplier.specialties?.length"
        class="flex flex-wrap gap-1 justify-center"
      >
        <UBadge
          v-for="specialty in supplier.specialties.slice(0, 3)"
          :key="specialty"
          variant="soft"
          size="sm"
        >
          {{ specialty }}
        </UBadge>
        <UBadge
          v-if="supplier.specialties.length > 3"
          variant="outline"
          size="sm"
        >
          +{{ supplier.specialties.length - 3 }} more
        </UBadge>
      </div>
    </div>
  </UCard>
</template>

<script setup>
// Props from parent
const props = defineProps({
  supplier: {
    type: Object,
    required: true,
  },
})

// Get initials for avatar fallback
function getInitials(name) {
  if (!name) return 'S'
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
