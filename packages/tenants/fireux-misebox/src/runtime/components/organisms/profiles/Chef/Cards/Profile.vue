<template>
  <UCard class="profile-card" @click="handleClick" style="cursor: pointer">
    <div class="profile-header">
      <UAvatar
        :src="chef?.avatarUrl"
        :alt="chef?.chef_name || 'Chef'"
        size="lg"
      />
      <div class="profile-info">
        <h4 v-if="chef?.chef_name" class="profile-name">
          {{ chef.chef_name }}
        </h4>
        <p v-if="chef?.title" class="profile-subtitle">{{ chef.title }}</p>
        <div v-if="chef?.years_experience" class="profile-meta">
          {{ chef.years_experience }}+ years experience
        </div>
      </div>
    </div>

    <p v-if="chef?.bio_long || chef?.bio_short" class="profile-bio">
      {{ chef.bio_long || chef.bio_short }}
    </p>

    <div v-if="chef?.specialties?.length" class="profile-tags">
      <span
        v-for="specialty in chef.specialties.slice(0, 3)"
        :key="specialty"
        class="tag"
      >
        {{ specialty }}
      </span>
      <span v-if="chef.specialties.length > 3" class="tag-more">
        +{{ chef.specialties.length - 3 }} more
      </span>
    </div>

    <div v-if="chef?.cuisine_expertise?.length" class="profile-section">
      <strong class="section-label">Cuisine Expertise:</strong>
      <span
        v-for="cuisine in chef.cuisine_expertise.slice(0, 2)"
        :key="cuisine"
        class="tag"
      >
        {{ cuisine }}
      </span>
      <span v-if="chef.cuisine_expertise.length > 2" class="tag-more">
        +{{ chef.cuisine_expertise.length - 2 }} more
      </span>
    </div>

    <div
      v-if="chef?.available_for_hire || chef?.total_recipes"
      class="profile-stats"
    >
      <div v-if="chef?.available_for_hire" class="stat-item">
        ✅ Available for hire
      </div>
      <div v-if="chef?.total_recipes" class="stat-item">
        📚 {{ chef.total_recipes }} recipes
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { Chef } from '../../../../../models/profiles/Chef.model'

const props = defineProps<{
  chef?: Partial<Chef>
  navigate?: (profile: any) => void
}>()

const handleClick = () => {
  if (props.navigate && props.chef) {
    props.navigate(props.chef)
  }
}
</script>
