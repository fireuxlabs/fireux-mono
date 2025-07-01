<template>
  <UCard
    class="cursor-pointer hover:shadow-md transition-shadow"
    @click="navigateTo(`/professionals/${professional.id}`)"
  >
    <div class="flex items-start gap-3">
      <!-- Avatar -->
      <div class="flex-shrink-0">
        <UAvatar
          v-if="professional.avatarUrl"
          :src="professional.avatarUrl"
          :alt="
            professional.displayName || professional.title || 'Professional'
          "
          size="md"
        />
        <UAvatar
          v-else
          :text="getInitials(professional.displayName || professional.title)"
          size="md"
          color="primary"
        />
      </div>

      <!-- Content -->
      <div class="flex-1 min-w-0">
        <h3 class="font-semibold text-lg mb-1">
          {{ professional.displayName || professional.title || 'Professional' }}
        </h3>

        <p
          v-if="professional.title && professional.displayName"
          class="text-sm text-gray-600 mb-2"
        >
          {{ professional.title }}
        </p>

        <p
          v-if="professional.bio_short"
          class="text-sm text-gray-700 mb-3 line-clamp-2"
        >
          {{ professional.bio_short }}
        </p>

        <p class="text-xs text-gray-500">ID: {{ professional.id }}</p>
      </div>
    </div>
  </UCard>
</template>

<script setup>
const props = defineProps({
  professional: {
    type: Object,
    required: true,
  },
})

function getInitials(name) {
  if (!name) return '?'
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function formatDate(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.getFullYear().toString()
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
