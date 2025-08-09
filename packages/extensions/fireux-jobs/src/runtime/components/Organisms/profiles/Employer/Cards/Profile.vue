<template>
  <UCard>
    <UAvatar
      :src="employer?.avatarUrl || employer?.profile_image?.url"
      :alt="employer?.company_name || 'Employer'"
      size="md"
    />
    <div class="info">
      <h4 v-if="employer?.company_name" class="card-header">
        {{ employer.company_name }}
      </h4>
      <p v-if="employer?.title" class="card-subtitle">{{ employer.title }}</p>
      <p v-if="employer?.business_type" class="tags">
        {{ employer.business_type }}
      </p>
    </div>
  </UCard>
</template>

<script setup>
defineProps({
  employer: {
    type: Object,
    required: false,
    default: () => ({
      company_name: 'Loading...',
      business_type: 'Employer',
      avatarUrl: '/default-avatar.png',
    }),
  },
})
</script>
