<template>
  <UCard class="cell-card">
    <div class="cell-header">
      <UAvatar
        :src="chef?.avatarUrl || chef?.profile_image?.url"
        :alt="chef?.chef_name || 'Chef'"
        size="md"
      />
      <div class="cell-info">
        <h4 v-if="chef?.chef_name" class="cell-title">{{ chef.chef_name }}</h4>
        <p v-if="chef?.title" class="cell-subtitle">{{ chef.title }}</p>
      </div>
    </div>
    
    <div class="cell-content">
      <p v-if="chef?.bio_short" class="cell-description">
        {{ chef.bio_short }}
      </p>
      
      <div class="cell-tags" v-if="chef?.specialties?.length || chef?.cuisine_expertise?.length">
        <span 
          v-for="specialty in chef?.specialties?.slice(0, 2)" 
          :key="specialty"
          class="cell-tag"
        >
          {{ specialty }}
        </span>
        <span 
          v-for="cuisine in chef?.cuisine_expertise?.slice(0, 1)" 
          :key="cuisine"
          class="cell-tag cuisine"
        >
          {{ cuisine }}
        </span>
      </div>
      
      <div class="cell-stats" v-if="chef?.years_experience || chef?.total_recipes">
        <span v-if="chef?.years_experience" class="cell-stat">
          👨‍🍳 {{ chef.years_experience }} years experience
        </span>
        <span v-if="chef?.total_recipes" class="cell-stat">
          📖 {{ chef.total_recipes }} recipes
        </span>
      </div>
      
      <div class="cell-badges" v-if="chef?.verified || chef?.available_for_hire">
        <span v-if="chef?.verified" class="cell-badge verified">✓ Verified</span>
        <span v-if="chef?.available_for_hire" class="cell-badge available">🟢 Available</span>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
defineProps<{
  chef?: Partial<Chef>
}>()
</script>
