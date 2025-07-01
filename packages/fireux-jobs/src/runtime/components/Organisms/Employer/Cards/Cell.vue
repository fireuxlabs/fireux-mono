<template>
  <div class="employer-cell">
    <div class="company-avatar">
      <UAvatar :src="employer?.logoUrl" size="lg" :alt="employer?.companyName">
        <template #fallback>
          <UIcon name="lucide:building-2" class="text-gray-500" />
        </template>
      </UAvatar>
    </div>
    <div class="company-info">
      <strong class="company-name">{{
        employer?.companyName || 'Company Name'
      }}</strong>
      <span class="contact-email">{{ employer?.contactEmail }}</span>
      <span v-if="employer?.website" class="website">
        <UIcon name="lucide:globe" class="inline w-3 h-3 mr-1" />
        {{ employer.website }}
      </span>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  employer: {
    type: Object,
    default: () => ({}),
  },
})
</script>

<style scoped>
.employer-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.company-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.company-name {
  font-weight: 600;
  font-size: 1rem;
  color: var(--text-primary);
}

.contact-email {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.website {
  font-size: 0.875rem;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
}
</style>
