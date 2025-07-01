<template>
  <UCard>
    <div class="flex items-center gap-4 mb-6">
      <UAvatar
        :src="professional?.avatarUrl"
        :alt="professional?.displayName"
        size="xl"
        :text="getInitials(professional?.displayName)"
      />
      <div>
        <h2 class="text-xl font-semibold">
          {{ professional?.displayName || 'Professional' }}
        </h2>
        <p v-if="professional?.email" class="text-gray-600 text-sm">
          {{ professional.email }}
        </p>
      </div>
    </div>

    <div v-if="professional?.bio" class="mb-6">
      <h3 class="font-medium mb-2">About</h3>
      <p class="text-gray-700">{{ professional.bio }}</p>
    </div>

    <div v-if="professional?.skills?.length">
      <h3 class="font-medium mb-2">Skills</h3>
      <div class="flex flex-wrap gap-2">
        <UBadge
          v-for="skill in professional.skills"
          :key="skill"
          variant="soft"
        >
          {{ skill }}
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
    default: null,
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
</script>
