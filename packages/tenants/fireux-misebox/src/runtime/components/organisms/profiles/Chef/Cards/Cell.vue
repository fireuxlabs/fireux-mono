<template>
  <div class="cell card-cell chef-theme">
    <div class="header">
      <img
        :src="
          chef.avatarUrl || chef.profile_image?.url || '/default-avatar.png'
        "
        :alt="`${chef.chef_name} avatar`"
        class="avatar"
      />
      <div class="info">
        <h3 class="name">{{ chef.chef_name }}</h3>
        <p v-if="chef.title" class="title">{{ chef.title }}</p>
      </div>
    </div>

    <p v-if="chef.bio_short" class="bio">{{ chef.bio_short }}</p>

    <div v-if="chef.specialties?.length" class="tags">
      <span
        v-for="specialty in chef.specialties.slice(0, 3)"
        :key="specialty"
        class="tag"
      >
        {{ specialty }}
      </span>
      <span v-if="chef.specialties.length > 3" class="more-tags">
        +{{ chef.specialties.length - 3 }} more
      </span>
    </div>

    <div v-if="chef.gallery?.length" class="gallery">
      <img
        v-for="(item, index) in chef.gallery.slice(0, 3)"
        :key="index"
        :src="item.image_url"
        :alt="item.name"
        class="thumb"
      />
      <span v-if="chef.gallery.length > 3" class="more-images">
        +{{ chef.gallery.length - 3 }}
      </span>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  chef: {
    type: Object,
    required: true,
  },
})
</script>
