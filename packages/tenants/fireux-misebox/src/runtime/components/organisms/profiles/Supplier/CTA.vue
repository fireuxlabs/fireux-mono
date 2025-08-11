<template>
  <div class="profile-cta">
    <div class="profile-cta-header">
      <h1 class="profile-cta-title">🚚 Create Your Supplier Profile</h1>
      <p class="profile-cta-description">
        Connect with chefs and restaurants as a trusted food supplier
      </p>
    </div>

    <div class="profile-cta-features">
      <div class="profile-cta-feature">
        <div class="profile-cta-feature-icon">🏢</div>
        <h3 class="profile-cta-feature-title">Business Profile</h3>
        <p class="profile-cta-feature-text">
          Showcase your company and products
        </p>
      </div>
      <div class="profile-cta-feature">
        <div class="profile-cta-feature-icon">📦</div>
        <h3 class="profile-cta-feature-title">Product Catalog</h3>
        <p class="profile-cta-feature-text">Display inventory and pricing</p>
      </div>
      <div class="profile-cta-feature">
        <div class="profile-cta-feature-icon">🤝</div>
        <h3 class="profile-cta-feature-title">Direct Orders</h3>
        <p class="profile-cta-feature-text">Receive orders from chefs</p>
      </div>
    </div>

    <div class="profile-cta-action">
      <UButton to="/suppliers/create" size="lg" color="primary">
        Create Supplier Profile
      </UButton>
      <p class="profile-cta-subtext">Free to join • Connect with local chefs</p>
    </div>
  </div>
</template>

<script setup>
// Clean CTA component for supplier profile creation
</script>
