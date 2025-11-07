<template>
  <UCard class="cell">
    <div class="cell-inner">
      <UAvatar
        :src="props.chef.avatar"
        :alt="props.chef.title || 'Chef'"
        size="md"
        :text="props.chef.initials"
      />
      <div class="meta">
        <div class="name">{{ props.chef.title || 'Chef' }}</div>
        <div v-if="props.chef.subtitle" class="title">
          {{ props.chef.subtitle }}
        </div>
        <div v-if="props.chef.bio_short" class="subtitle">
          {{ props.chef.bio_short }}
        </div>

        <div v-if="props.chef.specialties?.length" class="cell-badges">
          <UBadge
            v-for="s in props.chef.specialties"
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
import type { ChefCard } from '../../../../../models/profiles/Chef.model'

const props = defineProps<{ chef: ChefCard.Cell }>()
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
