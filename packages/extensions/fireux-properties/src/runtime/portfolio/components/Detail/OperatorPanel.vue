<!-- Concurrent edit — 2026-07-21 13:51 CEST — CSS necessity pass: let Nuxt UI own the public-action card root geometry. -->
<template>
  <UCard class="fx-card--public-action">
    <div class="fx-public-action">
      <div class="fx-public-action__badges">
        <UBadge color="primary" variant="soft"> Operator </UBadge>
      </div>

      <div class="fx-public-action__body">
        <UAvatar
          icon="i-lucide-key-round"
          size="md"
          class="fx-public-action__avatar"
        />

        <div class="fx-public-action__content">
          <div class="fx-public-action__copy">
            <h2 class="fx-public-action__title">Portfolio Operations</h2>
            <p class="fx-public-action__description">
              {{ panelDescription }}
            </p>
          </div>

          <div v-if="groups.length" class="fx-public-action__groups">
            <div
              v-for="group in groups"
              :key="group.label"
              class="fx-public-action__group"
            >
              <p class="fx-public-action__label">
                {{ group.label }}
              </p>
              <div class="fx-public-action__chips">
                <UBadge
                  v-for="item in group.items"
                  :key="item"
                  :color="group.color"
                  variant="soft"
                >
                  {{ item }}
                </UBadge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  visiblePublicActionGroups,
  type PublicActionGroup,
} from 'fireux-core/runtime/composables/public/usePublicActionPanel'
import type { PortfolioSurface } from '../../composables/firestore/utils/view/usePortfolioInterface'

const props = defineProps<{
  portfolio?: PortfolioSurface | null
}>()

const aligned = ['Identity', 'Document', 'Task', 'Compliance']
const notAligned = ['Client', 'Property', 'Unit']
const portfolioName = computed(() =>
  String(props.portfolio?.identity?.name || props.portfolio?.identity?.slug || '').trim()
)
const panelDescription = computed(() =>
  portfolioName.value
    ? `Portfolio operators manage documents, tasks, compliance, and private portfolio work for ${portfolioName.value}.`
    : 'Portfolio operators manage documents, tasks, compliance, and private portfolio work from the portfolio workspace.'
)
const groups = computed<PublicActionGroup[]>(() =>
  visiblePublicActionGroups([
    {
      label: 'Aligned',
      items: aligned,
      color: 'primary' as const,
    },
    {
      label: 'Not aligned yet',
      items: notAligned,
      color: 'neutral' as const,
    },
  ])
)
</script>
