<template>
  <div class="profile-cta">
    <div class="profile-cta-header">
      <h1 class="profile-cta-title">🏢 Create Your Employer Profile</h1>
      <p class="profile-cta-description">
        Connect with top talent and build your team
      </p>
    </div>

    <div class="profile-cta-features">
      <div class="profile-cta-feature">
        <div class="profile-cta-feature-icon">🏢</div>
        <h3 class="profile-cta-feature-title">Company Profile</h3>
        <p class="profile-cta-feature-text">Showcase your company culture</p>
      </div>
      <div class="profile-cta-feature">
        <div class="profile-cta-feature-icon">💼</div>
        <h3 class="profile-cta-feature-title">Post Jobs</h3>
        <p class="profile-cta-feature-text">Create and manage job listings</p>
      </div>
      <div class="profile-cta-feature">
        <div class="profile-cta-feature-icon">👥</div>
        <h3 class="profile-cta-feature-title">Find Talent</h3>
        <p class="profile-cta-feature-text">Search qualified professionals</p>
      </div>
    </div>

    <div class="profile-cta-action">
      <UButton to="/employers/create" size="lg" color="primary">
        Create Employer Profile
      </UButton>
      <p class="profile-cta-subtext">
        Free to join • Post jobs and find talent
      </p>
    </div>
  </div>
</template>

<script setup>
// Clean CTA component for employer profile creation
</script>
