<template>
  <UCard class="profiles cards card chef-theme">
    <div class="header">
      <UAvatar
        :src="chef?.avatarUrl || chef?.profile_image?.url"
        :alt="chef?.chef_name || 'Chef'"
        size="lg"
      />
      <div class="info">
        <h4 v-if="chef?.chef_name" class="title">
          {{ chef.chef_name }}
        </h4>
        <p v-if="chef?.title" class="subtitle">
          {{ chef.title }}
        </p>
        <div v-if="chef?.verified" class="stat">
          <UIcon name="i-lucide-check-circle" />
          <span>Verified Chef</span>
        </div>
      </div>
    </div>

    <p v-if="chef?.bio_short" class="description">
      {{ chef.bio_short }}
    </p>

    <div
      v-if="chef?.specialties?.length || chef?.cuisine_expertise?.length"
      class="tags"
    >
      <span
        v-for="specialty in (
          chef.specialties ||
          chef.cuisine_expertise ||
          []
        ).slice(0, 3)"
        :key="specialty"
        class="tag"
      >
        {{ specialty }}
      </span>
      <span
        v-if="(chef.specialties || chef.cuisine_expertise || []).length > 3"
        class="tag"
      >
        +{{
          (chef.specialties || chef.cuisine_expertise || []).length - 3
        }}
        more
      </span>
    </div>

    <div class="stats">
      <div v-if="chef?.years_experience" class="stat">
        <UIcon name="i-lucide-briefcase" />
        <span>{{ chef.years_experience }}+ years experience</span>
      </div>
      <div v-if="chef?.total_recipes" class="stat">
        <UIcon name="i-lucide-book-open" />
        <span>{{ chef.total_recipes }} recipes</span>
      </div>
      <div v-if="chef?.available_for_hire" class="stat">
        <UIcon name="i-lucide-circle-check" />
        <span>Available for hire</span>
      </div>
    </div>
  </UCard>
</template>

<script setup>
defineProps({
  chef: {
    type: Object,
    required: false,
    default: () => null,
  },
})
</script>
