<template>
  <UCard class="profiles cards profile chef-theme">
    <div class="header">
      <div class="avatar-section">
        <UAvatar
          :src="chef?.avatarUrl || chef?.profile_image?.url"
          :alt="chef?.chef_name || 'Chef'"
          size="xl"
        />
        <div v-if="chef?.verified" class="verification-badge">
          <UIcon name="i-lucide-check-circle" />
          <span>Verified Chef</span>
        </div>
      </div>
      <div class="info">
        <h2 v-if="chef?.chef_name" class="title">
          {{ chef.chef_name }}
        </h2>
        <p v-if="chef?.title" class="subtitle">
          {{ chef.title }}
        </p>
        <div class="meta-stats">
          <div v-if="chef?.available_for_hire" class="stat">
            <UIcon name="i-lucide-circle-check" />
            <span>Available for hire</span>
          </div>
          <div v-if="chef?.years_experience" class="stat">
            <UIcon name="i-lucide-briefcase" />
            <span>{{ chef.years_experience }}+ years experience</span>
          </div>
        </div>
      </div>
      <div class="actions">
        <UButton size="lg" color="primary">
          <UIcon name="i-lucide-message-circle" />
          Contact Chef
        </UButton>
        <UButton variant="outline" size="lg">
          <UIcon name="i-lucide-book-open" />
          View Recipes
        </UButton>
      </div>
    </div>

    <div v-if="chef?.bio_long || chef?.bio_short" class="description">
      {{ chef.bio_long || chef.bio_short }}
    </div>

    <div
      v-if="chef?.specialties?.length || chef?.cuisine_expertise?.length"
      class="tags"
    >
      <span
        v-for="specialty in chef.specialties || chef.cuisine_expertise || []"
        :key="specialty"
        class="tag"
      >
        {{ specialty }}
      </span>
    </div>

    <div v-if="chef?.gallery?.length" class="gallery-section">
      <h3>Portfolio</h3>
      <div class="gallery-grid">
        <div
          v-for="item in chef.gallery.slice(0, 4)"
          :key="item.name"
          class="gallery-item"
        >
          <img :src="item.image_url" :alt="item.name" class="gallery-image" />
          <p class="gallery-title">{{ item.name }}</p>
        </div>
      </div>
    </div>

    <div
      v-if="chef?.kitchens && Object.keys(chef.kitchens).length"
      class="kitchens-section"
    >
      <h3>Connected Kitchens</h3>
      <div class="kitchen-list">
        <div
          v-for="kitchen in Object.values(chef.kitchens).slice(0, 3)"
          :key="kitchen.name"
          class="kitchen-item"
        >
          <img
            v-if="kitchen.image_url"
            :src="kitchen.image_url"
            :alt="kitchen.name"
            class="kitchen-logo"
          />
          <span class="kitchen-name">{{ kitchen.name }}</span>
        </div>
      </div>
    </div>

    <div class="stats">
      <div v-if="chef?.total_recipes" class="stat">
        <UIcon name="i-lucide-book-open" />
        <span>{{ chef.total_recipes }} recipes</span>
      </div>
      <div v-if="chef?.gallery?.length" class="stat">
        <UIcon name="i-lucide-image" />
        <span>{{ chef.gallery.length }} portfolio items</span>
      </div>
      <div
        v-if="chef?.kitchens && Object.keys(chef.kitchens).length"
        class="stat"
      >
        <UIcon name="i-lucide-building" />
        <span>{{ Object.keys(chef.kitchens).length }} kitchen connections</span>
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
