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
        <button class="btn btn-primary" @click="redirectToCreate">
          Create Chef Profile
        </button>
      </div>
    </div>

    <!-- Show chef profile card if user has a chef profile -->
    <div v-else class="call-to-action-existing">
      <div class="existing-profile">
        <h2>👨‍🍳 Welcome back, Chef!</h2>
        <MiseChefCardsProfile :chef="currentChef" />
        <div class="quick-actions">
          <NuxtLink :to="`/chefs/${currentChef.id}`" class="btn btn-outline">
            View Profile
          </NuxtLink>
          <NuxtLink to="/kitchens/create" class="btn btn-primary">
            Create Kitchen
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { chefConfig } from '../../../models/profiles/Chef.model'

// Get current chef profile if it exists
const { current: currentChef } = await useProfile(chefConfig)

// Navigation
const router = useRouter()

const redirectToCreate = () => {
  router.push('/chefs/create')
}
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

.btn {
  display: inline-block;
  padding: 0.875rem 2rem;
  border-radius: 8px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s ease;
  border: none;
  cursor: pointer;
  font-size: 1rem;
}

.btn-primary {
  background-color: #22c55e;
  color: white;
}

.btn-primary:hover {
  background-color: #16a34a;
  transform: translateY(-1px);
}

.btn-outline {
  background-color: transparent;
  color: #22c55e;
  border: 2px solid #22c55e;
}

.btn-outline:hover {
  background-color: #22c55e;
  color: white;
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
