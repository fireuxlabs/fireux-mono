<template>
  <UCard class="profile">
    <div class="profile-header">
      <UAvatar :src="chef?.avatar" :alt="displayName" size="xl" />
      <div class="meta">
        <div class="name">{{ displayName }}</div>
        <div v-if="tagline" class="subtitle">
          {{ tagline }}
        </div>
      </div>
    </div>

    <div v-if="bioText" class="section">
      <div class="section-title">Bio</div>
      <p class="body">{{ bioText }}</p>
    </div>

    <div v-if="chef?.specialties?.length" class="section">
      <div class="section-title">Specialties</div>
      <div class="tags">
        <UBadge
          v-for="specialty in chef.specialties"
          :key="specialty"
          variant="soft"
          size="xs"
        >
          {{ specialty }}
        </UBadge>
      </div>
    </div>

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
import type { ChefCard } from '../../../../../models/profiles/Chef/Chef.model.ts'

const props = defineProps<{ chef: ChefCard.Profile }>()

const chef = computed(() => props.chef)
const displayName = computed(() => chef.value?.title || 'Chef')
const tagline = computed(
  () =>
    chef.value?.tagline ??
    (chef.value as { subtitle?: string | null } | null)?.subtitle ??
    ''
)
const bioText = computed(
  () => chef.value?.bio_long ?? chef.value?.bio_short ?? ''
)
const createdText = computed(() => '')
</script>
