<template>
  <UCard class="profile-card">
    <template #header>
      <div class="profile-header">
        <UAvatar :src="chef.avatar" :alt="chef.name" size="lg" />
        <div class="profile-info">
          <h3 class="profile-name">{{ chef.name }}</h3>
          <p v-if="chef.title" class="profile-subtitle">{{ chef.title }}</p>
        </div>
      </div>
    </template>

    <div class="profile-content">
      <!-- Bio -->
      <p v-if="bioText" class="profile-bio">{{ bioText }}</p>

      <!-- Specialties -->
      <div v-if="chef.specialties?.length" class="section">
        <h4 class="section-title">Specialties</h4>
        <div class="profile-tags">
          <span v-for="s in chef.specialties" :key="s" class="tag">{{
            s
          }}</span>
        </div>
      </div>

      <!-- Kitchens -->
      <div v-if="kitchenList.length" class="section">
        <h4 class="section-title">Kitchens</h4>
        <div class="kitchens">
          <div v-for="k in kitchenList" :key="k.name" class="kitchen">
            <UAvatar
              v-if="k.image_url"
              :src="k.image_url"
              :alt="k.name"
              size="xs"
            />
            <span>{{ k.name }}</span>
          </div>
        </div>
      </div>

      <!-- Gallery -->
      <div v-if="galleryList.length" class="section">
        <h4 class="section-title">Gallery</h4>
        <div class="gallery">
          <figure
            v-for="g in galleryList"
            :key="g.image_url"
            class="gallery-item"
          >
            <img :src="g.image_url" :alt="g.name || 'Dish'" />
            <figcaption v-if="g.name">{{ g.name }}</figcaption>
          </figure>
        </div>
      </div>

      <!-- Meta -->
      <div v-if="createdAtText || updatedAtText" class="profile-meta">
        <span v-if="createdAtText">Created: {{ createdAtText }}</span>
        <span v-if="updatedAtText">Updated: {{ updatedAtText }}</span>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ChefProfileProps } from '../../../../../models/profiles/Chef.model'

const props = defineProps<{ chef: ChefProfileProps & Record<string, any> }>()

// Prefer long bio > short bio (handles snake_case)
const bioText = computed(
  () => props.chef.bio_long ?? props.chef.bio_short ?? ''
)

type GalleryItem = { image_url?: string; name?: string }
const galleryList = computed<GalleryItem[]>(() =>
  Array.isArray(props.chef.gallery)
    ? ((props.chef.gallery as any[]).filter(
        (g) => g?.image_url
      ) as GalleryItem[])
    : []
)

type Kitchen = { image_url?: string; name: string }
const kitchenList = computed<Kitchen[]>(() =>
  props.chef.kitchens
    ? (Object.values(props.chef.kitchens as Record<string, Kitchen>).filter(
        (k) => k && (k as Kitchen).name
      ) as Kitchen[])
    : []
)

function toDate(val: any): Date | null {
  if (!val) return null
  if (val.seconds) return new Date(val.seconds * 1000)
  if (typeof val === 'string') {
    const d = new Date(val)
    return isNaN(d.getTime()) ? null : d
  }
  return null
}

const createdAtText = computed(() => {
  const d = toDate(props.chef.created_at ?? props.chef.created_at_iso_backup)
  return d ? d.toLocaleDateString() : ''
})

const updatedAtText = computed(() => {
  const d = toDate(props.chef.updated_at)
  return d ? d.toLocaleDateString() : ''
})
</script>

<style scoped>
.profile-card {
  display: block;
}
.profile-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.profile-name {
  font-weight: 600;
}
.profile-subtitle {
  color: var(--ui-text-muted);
  font-size: 0.9rem;
}
.profile-content {
  display: grid;
  gap: 1rem;
}
.profile-bio {
  margin-top: 0.5rem;
  line-height: 1.45;
}
.section {
  display: grid;
  gap: 0.5rem;
}
.section-title {
  font-size: 0.9rem;
  color: var(--ui-text-muted);
}
.profile-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.tag {
  background: var(--ui-muted);
  padding: 0.25rem 0.5rem;
  border-radius: 0.5rem;
  font-size: 0.85rem;
}
.kitchens {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}
.kitchen {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.gallery {
  display: grid;
  gap: 0.5rem;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
}
.gallery-item img {
  width: 100%;
  aspect-ratio: 4/3;
  object-fit: cover;
  border-radius: 0.5rem;
}
.profile-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.8rem;
  color: var(--ui-text-muted);
}
</style>
