<template>
  <UCard
    class="cursor-pointer hover:shadow-md transition-shadow"
    @click="navigateTo(`/employers/${employer.uid}`)"
  >
    <div class="flex items-center gap-3 mb-3">
      <UAvatar
        :src="employer.logoUrl"
        :alt="employer.companyName || 'Company'"
        size="md"
        :text="getInitials(employer.companyName)"
      />
      <div>
        <h3 class="font-semibold">
          {{ employer.companyName || 'Unknown Company' }}
        </h3>
        <p v-if="employer.contactEmail" class="text-sm text-gray-600">
          {{ employer.contactEmail }}
        </p>
      </div>
    </div>
    <p v-if="employer.description" class="text-sm text-gray-700 line-clamp-2">
      {{ employer.description }}
    </p>
    <ULink
      v-if="employer.website"
      :to="employer.website"
      target="_blank"
      class="text-xs text-blue-600 mt-2 block"
    >
      {{ formatWebsite(employer.website) }}
    </ULink>
  </UCard>
</template>

<script setup>
const props = defineProps({
  employer: {
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

function formatWebsite(url) {
  if (!url) return ''
  return url.replace(/^https?:\/\/(www\.)?/, '')
}
</script>
