<template>
  <UCard class="pill">
    <div class="pill-inner">
      <UAvatar
        :src="props.chef.avatar"
        :alt="props.chef.title || 'Chef'"
        :text="props.chef.initials"
        size="sm"
      />
      <div class="meta">
        <div class="name">{{ props.chef.title || 'Chef' }}</div>
        <div v-if="props.chef.subtitle" class="title">
          {{ props.chef.subtitle }}
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { ChefCard } from '../../../../../models/profiles/Chef.model'

const props = defineProps<{ chef: ChefCard.Pill }>()
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
