<template>
  <div class="profile-cta">
    <div class="profile-cta-header">
      <h1 class="profile-cta-title">🔥 Setup Your Core User Profile</h1>
      <p class="profile-cta-description">
        Create your FireUX account to access all applications in the ecosystem
      </p>
    </div>

    <div class="profile-cta-features">
      <div class="profile-cta-feature">
        <div class="profile-cta-feature-icon">🔐</div>
        <h3 class="profile-cta-feature-title">Single Sign-On</h3>
        <p class="profile-cta-feature-text">One account for all FireUX apps</p>
      </div>
      <div class="profile-cta-feature">
        <div class="profile-cta-feature-icon">👤</div>
        <h3 class="profile-cta-feature-title">Global Profile</h3>
        <p class="profile-cta-feature-text">Shared identity across ecosystem</p>
      </div>
      <div class="profile-cta-feature">
        <div class="profile-cta-feature-icon">⚡</div>
        <h3 class="profile-cta-feature-title">Quick Access</h3>
        <p class="profile-cta-feature-text">
          Fast onboarding to new applications
        </p>
      </div>
    </div>

    <div class="profile-cta-actions">
      <UButton color="primary" size="lg" @click="$emit('create')">
        Create Core Profile
      </UButton>
    </div>
  </div>
</template>

<script setup>
defineEmits(['create'])
</script>

<style scoped lang="scss">
.profile-cta {
  text-align: center;
  padding: 2rem;

  & > * + * {
    margin-top: 2rem;
  }

  &-header {
    & > * + * {
      margin-top: 1rem;
    }
  }

  &-title {
    font-size: 1.875rem;
    font-weight: 700;
    margin: 0;
  }

  &-description {
    color: rgb(75 85 99);
    font-size: 1.125rem;
    max-width: 42rem;
    margin: 0 auto;
  }

  &-features {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.5rem;

    @media (min-width: 768px) {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  &-feature {
    & > * + * {
      margin-top: 0.75rem;
    }

    &-icon {
      font-size: 2.25rem;
    }

    &-title {
      font-weight: 600;
      font-size: 1.125rem;
      margin: 0;
    }

    &-text {
      color: rgb(75 85 99);
      margin: 0;
    }
  }

  &-actions {
    padding-top: 1rem;
  }
}
</style>
