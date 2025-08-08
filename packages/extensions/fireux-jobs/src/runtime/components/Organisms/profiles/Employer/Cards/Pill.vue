<template>
  <UCard class="pill-card">
    <div class="pill-content">
      <UAvatar
        :src="
          employer?.avatarUrl ||
          employer?.profile_image?.url ||
          '/default-avatar.png'
        "
        :alt="employer?.displayName || 'Employer'"
        size="md"
      />
      <div class="pill-info">
        <div class="pill-name">
          {{ employer?.displayName || employer?.name || 'Unnamed Employer' }}
        </div>
        <div class="pill-subtitle">
          {{ employer?.company?.name || employer?.industry || 'Employer' }}
        </div>
      </div>
      <UBadge
        v-if="employer?.isVerified"
        color="green"
        variant="soft"
        size="xs"
      >
        Verified
      </UBadge>
    </div>
  </UCard>
</template>

<script setup>
defineProps({
  employer: {
    type: Object,
    required: false,
    default: () => ({
      displayName: 'Loading...',
      company: { name: 'Company' },
      industry: 'Business',
      avatarUrl: '/default-avatar.png',
    }),
  },
})
</script>

<style scoped>
.pill-card {
  /* Employer-specific overrides if needed */
  /* Example: border-left: 3px solid var(--ui-color-blue-500); */
}
</style>
