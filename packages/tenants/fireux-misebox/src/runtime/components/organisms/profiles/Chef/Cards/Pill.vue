<template>
  <UCard class="pill">
    <div class="pill-inner">
      <UAvatar
        :src="chef.avatar"
        :alt="chef.display_name"
        size="sm"
        :text="avatarInitials"
      />
      <div class="meta">
        <div class="name">{{ chef.display_name || 'Chef' }}</div>
        <div v-if="chef.title" class="title">{{ chef.title }}</div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ChefCard } from '../../../../../models/profiles/Chef.model'

const props = defineProps<{ chef: ChefCard.Pill }>()

const avatarInitials = computed(() => {
  const name = (props.chef.display_name || '').trim()
  if (!name) return 'C'
  return name.split(/\s+/).map(w => w[0] || '').join('').toUpperCase().slice(0, 2)
})
</script>

<style scoped>
.pill-inner {
  display: flex;
  align-items: center;
  gap: 0.625rem;
}
.meta .name {
  font-weight: 600;
  line-height: 1.1;
}
.meta .title {
  font-size: 0.85rem;
  opacity: 0.75;
}
</style>