<template>
  <div class="app-card" @click="$emit('click', app)">
    <!-- Click indicator -->
    <UIcon
      name="i-heroicons-arrow-top-right-on-square"
      class="click-indicator"
    />

    <!-- App header -->
    <div class="app-header">
      <div
        class="app-icon"
        :style="{ backgroundColor: app?.theme?.primary || '#3b82f6' }"
      >
        <UIcon :name="getAppIcon(app?.id)" class="app-icon-symbol" />
      </div>
      <div class="app-info">
        <div class="app-logo-container">
          <img
            v-if="app?.logos?.light"
            :src="getAppLogoUrl(app)"
            :alt="`${appName} logo`"
            class="app-logo"
            @error="handleLogoError"
          />
          <h3 v-else class="app-name">{{ appName }}</h3>
        </div>
        <div v-if="app?.status" class="app-status">{{ app.status }}</div>
      </div>
    </div>

    <!-- App description -->
    <p v-if="app?.description" class="app-description">
      {{ app.description }}
    </p>

    <!-- Theme preview -->
    <div v-if="app?.theme?.primary" class="theme-preview">
      <div
        class="theme-color"
        :style="{ backgroundColor: app.theme.primary }"
      ></div>
      <span class="theme-label">{{ app.theme.primary }}</span>
    </div>
  </div>
</template>

<script setup>
// Define emits
defineEmits(['click'])

// Props from parent
const props = defineProps({
  app: {
    type: Object,
    required: true,
  },
})

// Computed property for app display name
const appName = computed(() => {
  if (!props.app) return 'App'
  return props.app.app_name || props.app.name || props.app.id || 'App'
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

// Get app logo URL (use light version by default)
function getAppLogoUrl(app) {
  return `${app.domain}${app.logos?.light || '/img/logo-type-light.svg'}`
}

// Handle logo loading errors
function handleLogoError(event) {
  console.warn('Failed to load app logo:', event.target.src)
  // Hide the image on error, will fallback to app name
  event.target.style.display = 'none'
}
</script>

<style scoped>
.app-card {
  position: relative;
  padding: var(--space-6);
  border: 1px solid var(--ui-border);
  border-radius: var(--space-3);
  background: var(--ui-bg);
  cursor: pointer;
  transition: all 0.2s ease;
  overflow: hidden;
}

.app-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  border-color: var(--app-primary);
}

.app-header {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  margin-bottom: var(--space-4);
}

.app-icon {
  width: var(--space-12);
  height: var(--space-12);
  border-radius: var(--space-3);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
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
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0;
  color: var(--ui-text);
}

.app-logo-container {
  min-height: var(--space-6);
}

.app-logo {
  height: var(--space-6);
  width: auto;
  max-width: 120px;
  object-fit: contain;
}

.app-status {
  font-size: 0.75rem;
  color: var(--ui-text-muted);
  background: var(--ui-bg-elevated);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--space-2);
  margin-top: var(--space-1);
  display: inline-block;
}

.app-description {
  color: var(--ui-text-muted);
  font-size: 0.875rem;
  line-height: 1.5;
  margin-bottom: var(--space-4);
}

.theme-preview {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-4);
}

.theme-color {
  width: var(--space-4);
  height: var(--space-4);
  border-radius: var(--space-1);
  border: 1px solid var(--ui-border);
}

.theme-label {
  font-size: 0.75rem;
  color: var(--ui-text-muted);
  font-family: monospace;
}

.click-indicator {
  position: absolute;
  top: var(--space-4);
  right: var(--space-4);
  color: var(--ui-text-muted);
  opacity: 0;
  transition: opacity 0.2s ease;
  width: var(--space-4);
  height: var(--space-4);
}

.app-card:hover .click-indicator {
  opacity: 1;
}

/* Add subtle background pattern */
.app-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, var(--app-primary), transparent);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.app-card:hover::before {
  opacity: 1;
}
</style>
