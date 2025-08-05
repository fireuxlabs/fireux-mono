<template>
  <div class="profile-page">
    <!-- DEBUG: Raw Data Display -->
    <div
      class="debug-raw-data"
      style="
        background: #f3f4f6;
        padding: 1rem;
        margin: 1rem 0;
        border-radius: 8px;
      "
    >
      <h3>🔍 Debug: Raw Data</h3>

      <div style="margin: 1rem 0">
        <strong>Config:</strong>
        <pre
          style="
            background: white;
            padding: 0.5rem;
            border-radius: 4px;
            overflow: auto;
          "
          >{{ JSON.stringify(config, null, 2) }}</pre
        >
      </div>

      <div style="margin: 1rem 0">
        <strong>Current Profile:</strong>
        <pre
          style="
            background: white;
            padding: 0.5rem;
            border-radius: 4px;
            overflow: auto;
          "
          >{{ JSON.stringify(currentProfile, null, 2) }}</pre
        >
      </div>

      <div style="margin: 1rem 0">
        <strong>All Profiles ({{ profiles?.length || 0 }} items):</strong>
        <pre
          style="
            background: white;
            padding: 0.5rem;
            border-radius: 4px;
            overflow: auto;
            max-height: 300px;
          "
          >{{ JSON.stringify(profiles, null, 2) }}</pre
        >
      </div>

      <div style="margin: 1rem 0"><strong>Loading:</strong> {{ loading }}</div>
    </div>

    <!-- CTA Section (handled internally) -->
    <div v-if="!currentProfile" class="cta-section">
      <h2>Create Your {{ config.profileType }} Profile</h2>
      <p>Join our community of {{ config.profileType.toLowerCase() }}s</p>
      <button class="cta-button">Create Profile</button>
    </div>

    <!-- Profile Card (current user's profile) -->
    <slot v-if="currentProfile" name="profile-card" :profile="currentProfile" />

    <!-- Profile List (handled internally with generic list) -->
    <FireOrganismsProfileList
      :profiles="profiles"
      :loading="loading"
      :filter-composable="filterComposable"
    >
      <template #profile-item="{ profile }">
        <slot name="profile-item" :profile="profile" />
      </template>
    </FireOrganismsProfileList>
  </div>
</template>

<script setup>
// Single config prop - component handles everything internally
const props = defineProps({
  config: {
    type: Object,
    required: true,
    validator: (config) => {
      return config.profileType && config.collectionName
    },
  },
  filterComposable: {
    type: Function,
    required: true,
  },
})

// Component handles its own data fetching
const {
  all: profiles,
  loading,
  current: currentProfile,
} = await useProfile(props.config)
</script>
