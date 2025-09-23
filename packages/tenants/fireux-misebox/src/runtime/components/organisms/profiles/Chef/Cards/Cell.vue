<template>
  <UCard class="cell">
    <div class="cell-inner">
      <UAvatar
        :src="chef.avatar"
        :alt="chef.display_name"
        size="md"
        :text="avatarInitials"
      />
      <div class="meta">
        <div class="name">{{ chef.display_name || 'Chef' }}</div>
        <div v-if="chef.title" class="title">{{ chef.title }}</div>
        <div v-if="chef.bio_short" class="subtitle">{{ chef.bio_short }}</div>

        <div v-if="chef.specialties?.length" class="cell-badges">
          <UBadge
            v-for="s in chef.specialties"
            :key="s"
            size="xs"
            variant="soft"
          >
            {{ s }}
          </UBadge>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ChefCard } from '../../../../../models/profiles/Chef.model'

// With the flattened profile, ChefCard.Cell matches props directly.
const props = defineProps<{ chef: ChefCard.Cell }>()

const avatarInitials = computed(() => {
  const name = (props.chef.display_name || '').trim()
  if (!name) return 'C'
  return name
    .split(/\s+/)
    .map((w) => w[0] || '')
    .join('')
    .toUpperCase()
    .slice(0, 2)
})
</script>

<style scoped>
.cell-inner {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}
.meta .name {
  font-weight: 600;
}
.meta .title {
  opacity: 0.8;
  font-size: 0.9rem;
}
.meta .subtitle {
  opacity: 0.8;
  font-size: 0.85rem;
  margin-top: 0.2rem;
}
.cell-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  margin-top: 0.35rem;
}
</style>
