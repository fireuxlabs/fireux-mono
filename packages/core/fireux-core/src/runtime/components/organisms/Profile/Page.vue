<template>
  <div class="profile-page">
    <!-- Current User CTA Section -->
    <FireOrganismsProfileCTA
      :profile-config="profileConfig"
      :cta-config="ctaConfig"
      :current-profile="currentProfile"
    >
      <template #profile-card="{ profile }">
        <slot name="profile-card" :profile="profile" />
      </template>
    </FireOrganismsProfileCTA>

    <!-- Debug Section (temporary) -->
    <div v-if="showDebug" class="debug-section">
      <h2>Props Debug:</h2>
      <div style="margin: 1rem 0">
        <strong>Profile Config:</strong>
        <pre style="padding: 0.5rem; border-radius: 4px; font-size: 12px">{{
          JSON.stringify(profileConfig, null, 2)
        }}</pre>
      </div>
      <div style="margin: 1rem 0">
        <strong>Page Config:</strong>
        <pre style="padding: 0.5rem; border-radius: 4px; font-size: 12px">{{
          JSON.stringify(pageConfig, null, 2)
        }}</pre>
      </div>
      <div style="margin: 1rem 0">
        <strong>Data Summary:</strong>
        <ul style="list-style: disc; margin-left: 1.5rem">
          <li>Profiles: {{ profiles?.length || 0 }} items</li>
          <li>Loading: {{ loading }}</li>
          <li>Has Profile: {{ hasProfile }}</li>
        </ul>
      </div>
    </div>

    <!-- Page Header -->
    <div class="page-header">
      <h1>{{ pageConfig.title }}</h1>
      <p>{{ pageConfig.description }}</p>
    </div>

    <!-- Profile List -->
    <div class="profile-list-section">
      <slot
        name="profile-list"
        :profiles="profiles"
        :loading="loading"
        :profile-config="profileConfig"
      >
        <p>No profile-list slot content provided</p>
      </slot>
    </div>
  </div>
</template>

<script setup>
// Props
const props = defineProps({
  // Profile configuration from domain packages
  profileConfig: {
    type: Object,
    required: true,
    validator: (config) => {
      return config.profileType && config.collectionName
    },
  },

  // Profile data and loading state
  profiles: {
    type: Array,
    default: () => [],
  },

  loading: {
    type: Boolean,
    default: false,
  },

  // App users for debugging
  appUsers: {
    type: Array,
    default: () => [],
  },

  // Current user profile check function
  hasProfile: {
    type: Boolean,
    default: false,
  },

  // Page configuration
  pageConfig: {
    type: Object,
    required: true,
    validator: (config) => {
      return config.title && config.description
    },
  },

  // Status configuration
  statusConfig: {
    type: Object,
    required: true,
    validator: (config) => {
      return config.activeDescription && config.createDescription
    },
  },

  // Show debug section (development only)
  showDebug: {
    type: Boolean,
    default: false,
  },

  // CTA configuration for the domain-specific call-to-action
  ctaConfig: {
    type: Object,
    required: true,
    validator: (config) => {
      return config.title && config.description && config.createPath
    },
  },

  // Current user's profile (if they have one)
  currentProfile: {
    type: Object,
    default: null,
  },
})
</script>

<style scoped>
.profile-page {
  padding: 2rem 1rem;
  max-width: 1200px;
  margin: 0 auto;
}

.debug-section {
  margin: 2rem 0;
  padding: 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  background: #f9fafb;
}

.page-header {
  text-align: center;
  margin: 2rem 0;
}

.page-header h1 {
  font-size: 2.5rem;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 1rem;
}

.page-header p {
  font-size: 1.125rem;
  color: #6b7280;
  line-height: 1.6;
}

.profile-list-section {
  margin-top: 2rem;
}
</style>
