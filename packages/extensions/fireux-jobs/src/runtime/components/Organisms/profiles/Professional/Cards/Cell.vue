<template>
  <NuxtLink v-if="card?.to" :to="card.to" class="pill">
    <UAvatar :src="card.avatar" :alt="card.title" size="sm" class="avatar" />
    <div class="content">
      <span class="title">{{ card.title }}</span>

      <span v-if="card.tagline" class="tagline">
        {{ card.tagline }}
      </span>

      <div v-if="card.badges?.length" class="badges">
        <UBadge
          v-for="badge in card.badges"
          :key="badge"
          size="xs"
          variant="soft"
        >
          {{ badge }}
        </UBadge>
      </div>
    </div>
  </NuxtLink>

  <div v-else class="pill">
    <UAvatar :src="card?.avatar" :alt="card?.title" size="sm" class="avatar" />

    <div class="content">
      <span class="title">{{ card?.title }}</span>

      <span v-if="card?.tagline" class="tagline">
        {{ card.tagline }}
      </span>

      <div v-if="card?.badges?.length" class="badges">
        <UBadge
          v-for="badge in card.badges"
          :key="badge"
          size="xs"
          variant="soft"
        >
          {{ badge }}
        </UBadge>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ProfessionalCard } from '../../../../../models/profiles/Professional.model.ts'

const props = defineProps<{ professional: ProfessionalCard.Cell }>()

const card = computed(() => {
  const pill = props.professional

  return {
    ...pill,
    tagline: pill.tagline ?? pill.subtitle ?? '',
  }
})
</script>

<style scoped>
.pill {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: 1rem;
  background: var(--ui-background-200, rgba(148, 163, 184, 0.08));
  border: 1px solid var(--ui-border-200, rgba(148, 163, 184, 0.35));
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.pill:hover {
  border-color: var(--ui-primary-500, rgba(79, 70, 229, 0.6));
}

.avatar {
  border-radius: 9999px;
}

.content {
  display: flex;
  flex-direction: column;
}

.title {
  font-weight: 600;
}

.tagline {
  font-size: 0.8rem;
  color: var(--ui-text-500, rgba(148, 163, 184, 0.9));
}

.badges {
  display: flex;
  gap: 0.25rem;
  flex-wrap: wrap;
}
</style>
