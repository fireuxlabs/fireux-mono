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
import type {
  ProfessionalProfile,
} from '../../../../../models/profiles/Professional/Professional.model'
import type { ProfessionalCard } from '../../../../../composables/fireux/firestore/profiles/Professional/main/useProfessionalInterface'
import { resolveProfessionalCell } from '../../../../../composables/fireux/firestore/profiles/Professional/main/useProfessionalInterface'

const props = defineProps<{
  professional?: ProfessionalCard.ProfessionalCell | ProfessionalProfile | null
}>()

const isProfessionalCell = (
  payload: ProfessionalCard.ProfessionalCell | ProfessionalProfile
): payload is ProfessionalCard.ProfessionalCell => 'to' in payload

const card = computed<ProfessionalCard.ProfessionalCell | null>(() => {
  const source = props.professional
  if (!source) return null

  if (isProfessionalCell(source)) {
    return {
      ...source,
      avatar: source.avatar ?? undefined,
      to: source.to ?? undefined,
      tagline: source.tagline ?? source.subtitle ?? '',
    }
  }

  return resolveProfessionalCell(source)
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
