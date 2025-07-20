<script setup lang="ts">
// SEO and Meta
useSeoMeta({
  title: 'Misebox - Professional Kitchen Management Platform',
  description:
    'Master your culinary operations with digital recipe management, inventory control, and cost analysis. Built for chefs who demand precision.',
})

// Fetch the content for additional sections
const { data: page } = await useAsyncData('index', () =>
  queryCollection('content').path('/').first()
)
</script>

<script setup lang="ts">
// Check authentication status
const { $user } = useNuxtApp()

// SEO and Meta
useSeoMeta({
  title: 'Misebox - Professional Kitchen Management Platform',
  description:
    'Master your culinary operations with digital recipe management, inventory control, and cost analysis. Built for chefs who demand precision.',
})

// Use current user from vuefire
const { user } = useCurrentUser()

// Fetch the content for additional sections (only for landing page)
const { data: page } = !user.value ? await useAsyncData('index', () =>
  queryCollection('content').path('/').first()
) : { data: null }
</script>

<template>
  <div class="page">
    <!-- Dashboard for authenticated users -->
    <div v-if="user" class="dashboard">
      <h1 class="dashboard-title">Welcome to your Misebox Dashboard</h1>
      
      <!-- User Profile Section -->
      <section class="profile-section">
        <h2>Your Profile</h2>
        <div class="profile-preview">
          <p>👤 {{ user.displayName || user.email }}</p>
          <p>📧 {{ user.email }}</p>
          <div class="profile-note">
            <p>Set up your chef or supplier profile to get started</p>
          </div>
        </div>
      </section>

      <!-- Quick Actions -->
      <section class="quick-actions">
        <h2>Quick Actions</h2>
        <div class="action-grid">
          <NuxtLink to="/chefs" class="action-card">
            <div class="action-icon">👨‍🍳</div>
            <div class="action-text">Browse Chefs</div>
          </NuxtLink>
          <NuxtLink to="/suppliers" class="action-card">
            <div class="action-icon">🚚</div>
            <div class="action-text">Find Suppliers</div>
          </NuxtLink>
        </div>
      </section>
    </div>

    <!-- Landing page for non-authenticated users -->
    <div v-else>
      <!-- Hero Component -->
      <LandingHero />

      <!-- Solutions Component -->
      <LandingSolutions />

      <!-- Integrations Component -->
      <LandingIntegrations />

      <!-- Features Component - First Set -->
      <LandingFeatures :first="true" />

      <!-- Features Component - Second Set -->
      <LandingFeatures :second="true" />

      <!-- CTA Component -->
      <LandingCTA />
    </div>
  </div>
</template>

<style scoped>
.dashboard {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.dashboard-title {
  font-size: 2rem;
  font-weight: bold;
  color: var(--ui-primary);
  margin-bottom: 2rem;
}

.profile-section,
.quick-actions {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.profile-section h2,
.quick-actions h2 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--ui-text);
}

.profile-preview p {
  margin: 0.5rem 0;
  color: var(--ui-text-muted);
}

.profile-note {
  margin-top: 1rem;
  padding: 1rem;
  background: var(--ui-background);
  border-radius: 6px;
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.action-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem;
  background: var(--ui-background);
  border: 1px solid var(--ui-border);
  border-radius: 8px;
  text-decoration: none;
  transition: all 0.2s ease;
}

.action-card:hover {
  background: var(--ui-primary);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.action-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.action-text {
  font-weight: 500;
}
</style>

    <!-- Integrations Component -->
    <LandingIntegrations />

    <!-- Features Component - First Set -->
    <LandingFeatures :first="true" />

    <!-- Features Component - Second Set -->
    <LandingFeatures :second="true" />

    <!-- Content from CMS (if available) -->
    <div v-if="page">
      <ContentRenderer :value="page" />
    </div>

    <!-- Call to Action -->
    <LandingCTA />
  </div>
</template>

<style scoped>
/* Let components handle their own spacing with Tailwind/NuxtUI utilities */
</style>
