<template>
  <UCard class="profile">
    <!-- Header -->
    <div class="profile-header">
      <UAvatar :src="props.chef.avatar" :alt="displayName" size="xl" />
      <div class="meta">
        <div class="name">{{ displayName }}</div>
        <div v-if="tagline" class="subtitle">
          {{ tagline }}
        </div>
      </div>
    </div>

    <!-- Bio -->
    <div v-if="bioText" class="section">
      <div class="section-title">Bio</div>
      <p class="body">{{ bioText }}</p>
    </div>

    <!-- Specialties -->
    <div v-if="props.chef.specialties?.length" class="section">
      <div class="section-title">Specialties</div>
      <div class="tags">
        <UBadge
          v-for="s in props.chef.specialties"
          :key="s"
          variant="soft"
          size="xs"
        >
          {{ s }}
        </UBadge>
      </div>
    </div>

    <!-- Timestamps (Created only) -->
    <div v-if="createdText" class="section">
      <div class="section-title">Timestamps</div>
      <div class="meta-row">
        <span>Created: {{ createdText }}</span>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ChefCard } from '../../../../../models/profiles/Chef.model'

const props = defineProps<{ chef: ChefCard.Profile }>()

const displayName = computed(() => props.chef?.title || 'Chef')

const tagline = computed(
  () =>
    props.chef?.tagline ??
    (props.chef as { subtitle?: string | null } | null)?.subtitle ??
    ''
)

const bioText = computed(
  () => props.chef?.bio_long ?? props.chef?.bio_short ?? ''
)

// ChefCard.Profile does not include timestamps; leave empty string unless extended elsewhere
const createdText = computed(() => '')
</script>
