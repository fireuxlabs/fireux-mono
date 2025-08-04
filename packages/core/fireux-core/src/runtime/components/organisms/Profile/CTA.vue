<template>
  <div class="profile-cta">
    <!-- Show CTA if user doesn't have a profile -->
    <div v-if="!currentProfile" class="call-to-action-message">
      <div class="cta-content">
        <h2>{{ ctaConfig.title }}</h2>
        <p>{{ ctaConfig.description }}</p>
        <ul class="benefits-list">
          <li v-for="benefit in ctaConfig.benefits" :key="benefit">
            {{ benefit }}
          </li>
        </ul>
        <UButton :to="ctaConfig.createPath" size="lg">
          {{ ctaConfig.createButtonText }}
        </UButton>
      </div>
    </div>

    <!-- Show profile card if user has a profile -->
    <div v-else class="call-to-action-existing">
      <div class="existing-profile">
        <h2>{{ ctaConfig.welcomeBackText }}</h2>

        <!-- Generic profile card slot -->
        <slot name="profile-card" :profile="currentProfile">
          <div class="default-profile-card">
            <h3>{{ currentProfile.name || currentProfile.displayName }}</h3>
            <p>{{ currentProfile.bio || 'No bio available' }}</p>
          </div>
        </slot>

        <div class="quick-actions">
          <UButton
            :to="`${profileConfig.paths.view}/${currentProfile.id}`"
            variant="outline"
          >
            View Profile
          </UButton>
          <UButton
            v-for="action in ctaConfig.quickActions"
            :key="action.text"
            :to="action.path"
          >
            {{ action.text }}
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  profileConfig: {
    type: Object,
    required: true,
  },
  ctaConfig: {
    type: Object,
    required: true,
  },
  currentProfile: {
    type: Object,
    default: null,
  },
})
</script>

<style scoped>
.profile-cta {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
  margin-bottom: 2rem;
}

.call-to-action-message {
  text-align: center;
  padding: 3rem 2rem;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12px;
  border: 1px solid #dee2e6;
}

.cta-content h2 {
  font-size: 2.25rem;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 1rem;
}

.cta-content p {
  font-size: 1.125rem;
  color: #6b7280;
  margin-bottom: 2rem;
  line-height: 1.6;
}

.benefits-list {
  list-style: none;
  padding: 0;
  margin: 2rem 0;
  text-align: left;
  display: inline-block;
}

.benefits-list li {
  padding: 0.75rem 0;
  font-size: 1.1rem;
  color: #374151;
}

.call-to-action-existing {
  text-align: center;
  padding: 2rem;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.existing-profile h2 {
  font-size: 1.875rem;
  color: #1f2937;
  margin-bottom: 2rem;
}

.default-profile-card {
  padding: 1.5rem;
  background: white;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  margin: 1rem 0;
}

.quick-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
}

@media (max-width: 768px) {
  .quick-actions {
    flex-direction: column;
    align-items: center;
  }

  .benefits-list {
    text-align: center;
  }
}
</style>
