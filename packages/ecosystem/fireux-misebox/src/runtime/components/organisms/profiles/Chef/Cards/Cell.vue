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
import type { ChefProfile } from '../../../../../models/profiles/Chef/Chef.model'
import type { ChefCard } from '../../../../../composables/fireux/firestore/profiles/Chef/main/useChefInterface'
import { resolveChefCell } from '../../../../../composables/fireux/firestore/profiles/Chef/main/useChefInterface'

const props = defineProps<{ chef?: ChefCard.Cell | ChefProfile | null }>()

const card = computed<ChefCard.Cell | null>(() => {
  const source = props.chef
  if (!source) return null

  if ('to' in source) {
    return {
      ...source,
      avatar: source.avatar ?? undefined,
      to: source.to ?? undefined,
      tagline: source.tagline ?? source.subtitle ?? '',
    }
  }

  const resolved = resolveChefCell(source)
  if (!resolved) return null
  return {
    ...resolved,
    avatar: resolved.avatar ?? undefined,
    to: resolved.to ?? undefined,
    tagline: resolved.tagline ?? resolved.subtitle ?? '',
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
