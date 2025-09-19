<template>
  <UCard class="profile">
    <!-- Header -->
    <div class="profile-header">
      <UAvatar :src="chef.avatar" :alt="displayName" size="xl" />
      <div class="meta">
        <div class="name">{{ displayName }}</div>
        <div v-if="chef.title" class="subtitle">{{ chef.title }}</div>
      </div>
    </div>

    <!-- Bio -->
    <div v-if="bioText" class="section">
      <div class="section-title">Bio</div>
      <p class="body">{{ bioText }}</p>
    </div>

    <!-- Specialties -->
    <div v-if="chef.specialties?.length" class="section">
      <div class="section-title">Specialties</div>
      <div class="tags">
        <UBadge v-for="s in chef.specialties" :key="s" variant="soft" size="xs">
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

const displayName = computed(() => props.chef?.display_name || 'Chef')

const bioText = computed(
  () => props.chef?.bioLong ?? props.chef?.bioShort ?? ''
)

// ChefCard.Profile does not include timestamps; leave empty string unless extended elsewhere
const createdText = computed(() => '')
</script>
