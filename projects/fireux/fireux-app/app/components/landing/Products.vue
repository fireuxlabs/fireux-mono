<template>
  <section id="products" class="px-4 py-16">
    <h2 class="text-2xl font-bold text-center mb-8">Our Products</h2>

    <!-- Loading state -->
    <div v-if="loading" class="text-center text-gray-500">
      Loading ecosystem apps...
    </div>

    <!-- Products grid -->
    <div v-else class="grid gap-6 max-w-4xl mx-auto">
      <div
        v-for="app in apps"
        :key="app.appId"
        class="app-card"
        :style="{ '--app-primary': app.theme.primary }"
        @click="navigateToApp(app)"
      >
        <!-- App header with icon and name -->
        <div class="app-header">
          <div class="app-icon" :style="{ backgroundColor: app.theme.primary }">
            <Icon :name="getAppIcon(app.appId)" class="w-6 h-6 text-white" />
          </div>
          <div class="app-info">
            <div class="app-logo-container">
              <img
                v-if="app.logos?.light"
                :src="getAppLogoUrl(app)"
                :alt="app.name + ' logo'"
                class="app-logo"
                @error="handleLogoError"
              />
              <h3 v-else class="app-name">{{ app.name }}</h3>
            </div>
            <span class="app-status">{{ app.status }}</span>
          </div>
        </div>

        <!-- App description -->
        <p class="app-description">{{ app.description }}</p>

        <!-- Theme preview -->
        <div class="theme-preview">
          <div
            class="theme-color"
            :style="{ backgroundColor: app.theme.primary }"
          ></div>
          <span class="theme-label">{{ app.theme.primary }}</span>
        </div>

        <!-- Click indicator -->
        <div class="click-indicator">
          <Icon name="i-heroicons-arrow-top-right-on-square" class="w-4 h-4" />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
const { apps, loading, fetchApps } = useApps()

// Fetch apps on mount
onMounted(async () => {
  await fetchApps()
})

// Navigate to app
const navigateToApp = (app) => {
  if (app.appId === 'fireux-app') {
    // Navigate within the same app
    navigateTo(app.url)
  } else {
    // Open external app in new tab
    window.open(app.url, '_blank')
  }
}

// Get app icon based on appId
const getAppIcon = (appId) => {
  const icons = {
    'fireux-app': 'i-heroicons-fire',
    'cleanbox-app': 'i-heroicons-cube',
    'misebox-app': 'i-heroicons-cloud',
  }
  return icons[appId] || 'i-heroicons-square-3-stack-3d'
}

// Get app logo URL (use light version by default)
const getAppLogoUrl = (app) => {
  return `${app.domain}${app.logos?.light || '/img/logo-type-light.svg'}`
}

// Handle logo loading errors
const handleLogoError = (event) => {
  console.warn('Failed to load app logo:', event.target.src)
  // Hide the image on error, will fallback to app name
  event.target.style.display = 'none'
}
</script>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

@media (min-width: 768px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.app-card {
  position: relative;
  padding: 1.5rem;
  border: 1px solid var(--ui-border);
  border-radius: 0.75rem;
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
  gap: 1rem;
  margin-bottom: 1rem;
}

.app-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.app-name {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0;
  color: var(--ui-text);
}

.app-logo-container {
  min-height: 1.5rem;
}

.app-logo {
  height: 1.5rem;
  width: auto;
  max-width: 120px;
  object-fit: contain;
}

.app-status {
  font-size: 0.75rem;
  color: var(--ui-text-muted);
  background: var(--ui-bg-elevated);
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  margin-top: 0.25rem;
  display: inline-block;
}

.app-description {
  color: var(--ui-text-muted);
  font-size: 0.875rem;
  line-height: 1.5;
  margin-bottom: 1rem;
}

.theme-preview {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.theme-color {
  width: 1rem;
  height: 1rem;
  border-radius: 0.25rem;
  border: 1px solid var(--ui-border);
}

.theme-label {
  font-size: 0.75rem;
  color: var(--ui-text-muted);
  font-mono: monospace;
}

.click-indicator {
  position: absolute;
  top: 1rem;
  right: 1rem;
  color: var(--ui-text-muted);
  opacity: 0;
  transition: opacity 0.2s ease;
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
