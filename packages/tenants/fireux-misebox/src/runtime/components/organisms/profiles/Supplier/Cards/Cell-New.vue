<template>
  <div class="cell card-cell supplier-theme">
    <div class="header">
      <img
        :src="
          supplier.avatarUrl ||
          supplier.profile_image?.url ||
          '/default-avatar.png'
        "
        :alt="`${supplier.business_name} avatar`"
        class="avatar"
      />
      <div class="info">
        <h3 class="name">{{ supplier.business_name }}</h3>
        <p v-if="supplier.title" class="title">{{ supplier.title }}</p>
      </div>
    </div>

    <p v-if="supplier.bio_short" class="bio">{{ supplier.bio_short }}</p>

    <div v-if="supplier.specialties?.length" class="tags">
      <span
        v-for="specialty in supplier.specialties.slice(0, 3)"
        :key="specialty"
        class="tag"
      >
        {{ specialty }}
      </span>
      <span v-if="supplier.specialties.length > 3" class="more-tags">
        +{{ supplier.specialties.length - 3 }} more
      </span>
    </div>

    <div v-if="supplier.gallery?.length" class="gallery">
      <img
        v-for="(item, index) in supplier.gallery.slice(0, 4)"
        :key="index"
        :src="item.image_url"
        :alt="item.name"
        class="thumb"
      />
      <div v-if="supplier.gallery.length > 4" class="more-images">
        +{{ supplier.gallery.length - 4 }} more
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Supplier } from '../../../models/profiles/Supplier.model'

interface Props {
  supplier: Supplier
}

defineProps<Props>()
</script>
