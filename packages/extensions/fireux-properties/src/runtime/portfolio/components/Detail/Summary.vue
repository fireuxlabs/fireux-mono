<template>
  <UCard>
    <div>
      <UAvatar
        :src="card.imageUrl || undefined"
        :alt="card.title"
        icon="i-lucide-briefcase-business"
        size="3xl"
      />

      <div class="fx-card-body-stack">
        <div class="fx-card-body-stack">
          <div class="fx-type-label">Portfolio</div>
          <h2 class="fx-type-card-heading">
            {{ card.title }}
          </h2>
          <p v-if="card.subtitle">
            {{ card.subtitle }}
          </p>
        </div>

        <div class="card__badges">
          <UBadge v-if="card.status" color="neutral" variant="soft">
            {{ card.status }}
          </UBadge>
          <UBadge
            v-for="badge in card.badges"
            :key="badge"
            color="neutral"
            variant="soft"
          >
            {{ badge }}
          </UBadge>
        </div>

        <dl>
          <div v-if="card.ownerLabel" class="fx-card-body-stack">
            <dt class="fx-type-label">Owner</dt>
            <dd>{{ card.ownerLabel }}</dd>
          </div>
          <div v-if="card.regionLabel" class="fx-card-body-stack">
            <dt class="fx-type-label">Region</dt>
            <dd>{{ card.regionLabel }}</dd>
          </div>
        </dl>

        <p v-if="card.summary">
          {{ card.summary }}
        </p>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { PortfolioCard } from '../../composables/firestore/utils/view/usePortfolioInterface'

defineProps<{
  card: PortfolioCard.Card
}>()
</script>
