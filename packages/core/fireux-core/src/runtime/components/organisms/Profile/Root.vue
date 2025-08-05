<template>
  <div class="profile-page">
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

    <!-- DEBUG: Raw Data Display (moved to bottom) -->
    <div
      class="debug-raw-data"
      style="
        background: #f3f4f6;
        padding: 1rem;
        margin: 2rem 0;
        border-radius: 8px;
      "
    >
      <div
        style="
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        "
      >
        <h3>🔍 Debug: Raw Data</h3>
        <button
          @click="copyDebugData"
          style="
            padding: 0.5rem 1rem;
            background: #3b82f6;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
          "
        >
          {{ copied ? '✓ Copied!' : 'Copy Data' }}
        </button>
      </div>

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
          >{{ JSON.stringify(currentProfile?.value || null, null, 2) }}</pre
        >
      </div>

      <div style="margin: 1rem 0">
        <strong
          >All Profiles ({{ profiles?.value?.length || 0 }} items):</strong
        >
        <pre
          style="
            background: white;
            padding: 0.5rem;
            border-radius: 4px;
            overflow: auto;
            max-height: 300px;
          "
          >{{ JSON.stringify(profiles?.value || [], null, 2) }}</pre
        >
      </div>

      <div style="margin: 1rem 0">
        <strong>Loading:</strong> {{ loading?.value || false }}
      </div>
    </div>
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

// Copy functionality
const copied = ref(false)

const copyDebugData = async () => {
  try {
    // Create a copy of config without functions to avoid JSON.stringify issues
    const configCopy = { ...props.config }
    if (configCopy.validationFn) {
      configCopy.validationFn =
        '[Function: ' + configCopy.validationFn.name + ']'
    }

    const debugData = {
      config: configCopy,
      currentProfile: currentProfile?.value || null,
      profiles: profiles?.value || [],
      loading: loading?.value || false,
      timestamp: new Date().toISOString(),
    }

    await navigator.clipboard.writeText(JSON.stringify(debugData, null, 2))
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy debug data:', err)
    // Try to copy just the essential data if full copy fails
    try {
      const fallbackData = {
        profiles: profiles?.value || [],
        currentProfile: currentProfile?.value || null,
        profileCount: (profiles?.value || []).length,
        timestamp: new Date().toISOString(),
        error: 'Primary copy failed, using fallback',
      }
      await navigator.clipboard.writeText(JSON.stringify(fallbackData, null, 2))
      copied.value = true
      setTimeout(() => {
        copied.value = false
      }, 2000)
    } catch (fallbackErr) {
      console.error('Fallback copy also failed:', fallbackErr)
      // Last resort - copy a simple message
      try {
        const errorData = {
          error: 'Could not access profile data',
          timestamp: new Date().toISOString(),
          config: configCopy,
        }
        await navigator.clipboard.writeText(JSON.stringify(errorData, null, 2))
        copied.value = true
        setTimeout(() => {
          copied.value = false
        }, 2000)
      } catch (finalErr) {
        console.error('All copy attempts failed:', finalErr)
      }
    }
  }
}
</script>
