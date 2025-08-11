<template>
  <div class="profile-cta">
    <div class="profile-cta-header">
      <h1 class="profile-cta-title">🍳 Create Your Chef Profile</h1>
      <p class="profile-cta-description">
        Join Misebox to showcase your culinary expertise and connect with the
        food service community
      </p>
    </div>

    <div class="profile-cta-features">
      <div class="profile-cta-feature">
        <div class="profile-cta-feature-icon">👨‍🍳</div>
        <h3 class="profile-cta-feature-title">Professional Profile</h3>
        <p class="profile-cta-feature-text">
          Showcase your skills and experience
        </p>
      </div>
      <div class="profile-cta-feature">
        <div class="profile-cta-feature-icon">📱</div>
        <h3 class="profile-cta-feature-title">Digital Portfolio</h3>
        <p class="profile-cta-feature-text">Upload photos and manage recipes</p>
      </div>
      <div class="profile-cta-feature">
        <div class="profile-cta-feature-icon">🤝</div>
        <h3 class="profile-cta-feature-title">Network & Connect</h3>
        <p class="profile-cta-feature-text">
          Connect with suppliers and restaurants
        </p>
      </div>
    </div>

    <div class="profile-cta-action">
      <UButton to="/chefs/create" size="lg" color="primary">
        Create Chef Profile
      </UButton>
      <p class="profile-cta-subtext">
        Free to join • Takes less than 5 minutes
      </p>
    </div>
  </div>
</template>

<script setup>
// Clean CTA component for chef profile creation
</script>
