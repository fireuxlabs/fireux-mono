<template>
  <NuxtLink v-if="card?.to" :to="card.to" class="pill">
    <UAvatar
      :src="card.company_avatar || card.avatar"
      :alt="companyName(card)"
      size="sm"
      class="avatar"
    />

    <div class="content">
      <span class="company">{{ companyName(card) }}</span>
      <span v-if="card.title" class="contact">{{ card.title }}</span>

      <span v-if="card.tagline" class="tagline">
        {{ card.tagline }}
      </span>

      <span v-if="card.bio_short" class="bio">
        {{ card.bio_short }}
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
    <UAvatar
      :src="card?.company_avatar || card?.avatar"
      :alt="companyName(card || null)"
      size="sm"
      class="avatar"
    />

    <div class="content">
      <span class="company">{{ companyName(card || null) }}</span>
      <span v-if="card?.title" class="contact">{{ card.title }}</span>

      <span v-if="card?.tagline" class="tagline">
        {{ card.tagline }}
      </span>

      <span v-if="card?.bio_short" class="bio">
        {{ card.bio_short }}
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
  SupplierCard,
  SupplierProfile,
} from '../../../../../../models/profiles/Supplier.model.ts'
import { resolveSupplierCell } from '../../../../../models/profiles/Supplier.model.ts'

const props = defineProps<{
  supplier?: SupplierCard.Cell | SupplierProfile | null
}>()

const card = computed(() => {
  const source = props.supplier
  if (!source) return null

  if ('user' in source) {
    const resolved = resolveSupplierCell(source)
    if (resolved) {
      return {
        ...resolved,
        tagline: resolved.tagline ?? resolved.subtitle ?? '',
      }
    }
  }

  return {
    ...source,
    tagline: source.tagline ?? source.subtitle ?? '',
  }
})

const companyName = (payload?: SupplierCard.Cell | null) =>
  payload?.company_name || payload?.title || 'Supplier'
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

.company {
  font-weight: 600;
}

.contact {
  font-size: 0.8rem;
  color: var(--ui-text-500, rgba(148, 163, 184, 0.9));
}

.tagline {
  font-size: 0.8rem;
  color: var(--ui-text-500, rgba(148, 163, 184, 0.9));
}

.bio {
  font-size: 0.85rem;
  color: var(--ui-text-600, rgba(71, 85, 105, 0.95));
}

.badges {
  display: flex;
  gap: 0.25rem;
  flex-wrap: wrap;
}
</style>
