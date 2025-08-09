<template>
  <div class="profile-pill employer-theme">
    <img
      :src="
        employer?.avatarUrl ||
        employer?.profile_image?.url ||
        '/default-avatar.png'
      "
      :alt="`${employer?.company_name || employer?.displayName || 'Employer'} avatar`"
      class="pill-avatar"
    />
    <div class="pill-info">
      <h4 class="pill-name">
        {{
          employer?.company_name ||
          employer?.displayName ||
          employer?.name ||
          'Loading...'
        }}
      </h4>
      <p class="pill-subtitle">
        {{ employer?.business_type || employer?.industry || 'Employer' }}
      </p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  employer: {
    type: Object,
    required: false,
    default: () => ({
      company_name: 'Loading...',
      displayName: 'Loading...',
      business_type: 'Employer',
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
