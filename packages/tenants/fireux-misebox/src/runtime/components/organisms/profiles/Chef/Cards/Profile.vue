<template>
  <UCard class="profile-card profile-variant">
    <div class="profile-header">
      <UAvatar
        :src="chef?.avatarUrl || chef?.profile_image?.url"
        :alt="chef?.chef_name || 'Chef'"
        size="lg"
        class="profile-avatar-large"
      />
      <h3 v-if="chef?.chef_name" class="profile-title">
        {{ chef.chef_name }}
      </h3>
      <p v-if="chef?.title" class="profile-subtitle-main">
        {{ chef.title }}
      </p>
      <div v-if="chef?.verified" class="profile-location">
        ✅ Verified Chef
      </div>
    </div>

    <div class="profile-body">
      <p v-if="chef?.bio_short" class="profile-description-main">
        {{ chef.bio_short }}
      </p>

      <div class="profile-highlights" v-if="chef?.years_experience || chef?.total_recipes">
        <div v-if="chef?.years_experience" class="profile-highlight">
          <span class="highlight-value">{{ chef.years_experience }}</span>
          <span class="highlight-label">Years Experience</span>
        </div>
        <div v-if="chef?.total_recipes" class="profile-highlight">
          <span class="highlight-value">{{ chef.total_recipes }}</span>
          <span class="highlight-label">Recipes</span>
        </div>
        <div v-if="chef?.specialties?.length" class="profile-highlight">
          <span class="highlight-value">{{ chef.specialties.length }}</span>
          <span class="highlight-label">Specialties</span>
        </div>
        <div v-if="chef?.cuisine_expertise?.length" class="profile-highlight">
          <span class="highlight-value">{{ chef.cuisine_expertise.length }}</span>
          <span class="highlight-label">Cuisines</span>
        </div>
      </div>

      <div class="profile-tags-main" v-if="chef?.specialties?.length || chef?.cuisine_expertise?.length">
        <span 
          v-for="specialty in chef?.specialties?.slice(0, 3)" 
          :key="specialty"
          class="profile-tag-main featured"
        >
          {{ specialty }}
        </span>
        <span 
          v-for="cuisine in chef?.cuisine_expertise?.slice(0, 2)" 
          :key="cuisine"
          class="profile-tag-main"
        >
          {{ cuisine }}
        </span>
      </div>
    </div>

    <div class="profile-footer">
      <div class="profile-badges-main">
        <span v-if="chef?.verified" class="profile-badge-main verified">
          ✓ Verified
        </span>
        <span v-if="chef?.available_for_hire" class="profile-badge-main available">
          🟢 Available
        </span>
      </div>
      
      <div class="profile-contact">
        <button class="profile-action-btn">View Recipes</button>
        <button class="profile-action-btn primary">Hire</button>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
defineProps<{
  chef?: Partial<Chef>
}>()
</script>
