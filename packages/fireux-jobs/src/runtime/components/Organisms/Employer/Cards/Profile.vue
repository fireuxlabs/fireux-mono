<template>
  <UCard>
    <div class="flex items-center gap-4 mb-6">
      <UAvatar
        :src="employer?.logoUrl"
        :alt="employer?.companyName"
        size="xl"
        :text="getInitials(employer?.companyName)"
      />
      <div>
        <h2 class="text-xl font-semibold">
          {{ employer?.companyName || 'Company' }}
        </h2>
        <p v-if="employer?.contactEmail" class="text-gray-600 text-sm">
          {{ employer.contactEmail }}
        </p>
        <ULink
          v-if="employer?.website"
          :to="employer.website"
          target="_blank"
          class="text-sm"
        >
          {{ formatWebsite(employer.website) }}
        </ULink>
      </div>
    </div>

    <div v-if="employer?.description">
      <h3 class="font-medium mb-2">About the Company</h3>
      <p class="text-gray-700">{{ employer.description }}</p>
    </div>
  </UCard>
</template>

<script setup>
// Props from parent
const props = defineProps({
  employer: {
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

function formatWebsite(url) {
  if (!url) return ''
  // Remove protocol and www for display
  return url.replace(/^https?:\/\/(www\.)?/, '')
}
</script>
