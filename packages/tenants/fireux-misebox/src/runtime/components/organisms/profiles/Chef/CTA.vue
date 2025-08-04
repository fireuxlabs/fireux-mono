<template>
  <div class="chef-cta">
    <!-- Show CTA if user doesn't have a chef profile -->
    <div v-if="!currentChef" class="call-to-action-message">
      <div class="cta-content">
        <h2>🍳 Step Into Your Chef Journey</h2>
        <p>
          Join Misebox as a Chef to showcase your culinary expertise, manage
          your kitchens, and connect with the food service community.
        </p>
        <ul class="benefits-list">
          <li>✨ Create and manage your chef profile</li>
          <li>🏠 Set up and manage kitchens</li>
          <li>📝 Organize recipes and ingredients</li>
          <li>🤝 Connect with suppliers and other chefs</li>
        </ul>
        <UButton to="/chefs/create" size="lg"> Create Chef Profile </UButton>
      </div>
    </div>

    <!-- Show chef profile card if user has a chef profile -->
    <div v-else class="call-to-action-existing">
      <div class="existing-profile">
        <h2>👨‍🍳 Welcome back, Chef!</h2>
        <MiseChefCardsProfile :chef="currentChef" />
        <div class="quick-actions">
          <UButton :to="`/chefs/${currentChef.id}`" variant="outline">
            View Profile
          </UButton>
          <UButton to="/kitchens/create"> Create Kitchen </UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { chefConfig } from '../../../../models/profiles/Chef.model'

// Get current chef profile if it exists
const { current: currentChef } = await useProfile(chefConfig)
</script>

<style scoped>
.chef-cta {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
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
