<template>
  <UCard>
    <div class="app-profile-header">
      <div class="app-icon-container">
        <div
          class="app-icon"
          :style="{ backgroundColor: app?.theme?.primary || '#3b82f6' }"
        >
          <UIcon :name="getAppIcon(app?.id)" class="app-icon-symbol" />
        </div>
      </div>
      <div class="app-info">
        <h2 class="app-name">{{ appName }}</h2>
        <p v-if="app?.id" class="app-id">{{ app.id }}</p>
      </div>
    </div>

    <div v-if="app?.description" class="app-description">
      <h3 class="section-title">Description</h3>
      <p class="section-content">{{ app.description }}</p>
    </div>

    <div v-if="app?.created_at" class="app-metadata">
      <h3 class="section-title">Created</h3>
      <p class="section-content">{{ formattedCreatedDate }}</p>
    </div>

    <div v-if="hasAdmins" class="app-metadata">
      <h3 class="section-title">Administrators</h3>
      <p class="section-content">{{ app.admin_ids.length }} admin(s)</p>
    </div>

    <div v-if="hasSocialLinks" class="app-social-links">
      <h3 class="section-title">Social Links</h3>
      <div class="social-links-grid">
        <a
          v-for="(url, platform) in app.social_links"
          :key="platform"
          :href="url"
          target="_blank"
          class="social-link"
        >
          <UIcon :name="getSocialIcon(platform)" class="social-link-icon" />
          <span class="social-link-platform">{{ platform }}</span>
        </a>
      </div>
    </div>
  </UCard>
</template>

<script setup>
// Props from parent
const props = defineProps({
  app: {
    type: Object,
    default: null,
  },
})

// Computed property for app display name
const appName = computed(() => {
  if (!props.app) return 'App'
  return props.app.app_name || props.app.name || props.app.id || 'App'
})

// Computed property for formatted creation date
const formattedCreatedDate = computed(() => {
  if (!props.app?.created_at) return null

  let date
  try {
    date =
      typeof props.app.created_at === 'string'
        ? new Date(props.app.created_at)
        : props.app.created_at

    // Check if date is valid
    if (!date || isNaN(date.getTime())) return null

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch (error) {
    console.warn(
      'Invalid date format for app created_at:',
      props.app.created_at
    )
    return null
  }
})

// Computed property for admin presence
const hasAdmins = computed(() => {
  return props.app?.admin_ids && props.app.admin_ids.length > 0
})

// Computed property for social links presence
const hasSocialLinks = computed(() => {
  return (
    props.app?.social_links &&
    Object.keys(props.app.social_links).some((key) =>
      props.app.social_links[key]?.trim()
    )
  )
})

// Get app icon based on app ID
function getAppIcon(appId) {
  const icons = {
    'fireux-app': 'i-heroicons-fire',
    'cleanbox-app': 'i-heroicons-cube',
    'misebox-app': 'i-heroicons-cloud',
  }
  return icons[appId] || 'i-heroicons-square-3-stack-3d'
}

// Get social media icon
function getSocialIcon(platform) {
  const icons = {
    website: 'i-heroicons-globe-alt',
    twitter: 'i-simple-icons-twitter',
    linkedin: 'i-simple-icons-linkedin',
    github: 'i-simple-icons-github',
    instagram: 'i-simple-icons-instagram',
    facebook: 'i-simple-icons-facebook',
    youtube: 'i-simple-icons-youtube',
  }
  return icons[platform] || 'i-heroicons-link'
}
</script>

<style scoped>
.app-profile-header {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  margin-bottom: var(--space-6);
}

.app-icon-container {
  flex-shrink: 0;
}

.app-icon {
  width: var(--space-12);
  height: var(--space-12);
  border-radius: var(--space-3);
  display: flex;
  align-items: center;
  justify-content: center;
}

.app-icon-symbol {
  width: var(--space-6);
  height: var(--space-6);
  color: white;
}

.app-info {
  flex: 1;
  min-width: 0;
}

.app-name {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.app-id {
  font-size: 0.875rem;
  color: #6b7280;
  font-family: monospace;
  margin: var(--space-1) 0 0 0;
}

.app-description,
.app-metadata {
  margin-bottom: var(--space-4);
}

.section-title {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin: 0 0 var(--space-2) 0;
}

.section-content {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
  line-height: 1.5;
}

.app-social-links {
  margin-bottom: 0;
}

.social-links-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: var(--space-2);
}

.social-link {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2);
  border-radius: var(--space-2);
  text-decoration: none;
  color: #6b7280;
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
}

.social-link:hover {
  background-color: #f3f4f6;
  color: #374151;
}

.social-link-icon {
  width: var(--space-4);
  height: var(--space-4);
  flex-shrink: 0;
}

.social-link-platform {
  font-size: 0.75rem;
  text-transform: capitalize;
  truncate: true;
}
</style>
