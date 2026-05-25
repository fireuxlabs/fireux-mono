<template>
  <div class="mx-auto w-full max-w-3xl space-y-4">
    <AgentCardsCell
      v-bind="card"
      :show-subtitle="showSubtitle"
      :link="Boolean(card.to)"
      class="block"
    />

    <UCard>
      <div class="space-y-4">
        <div class="space-y-1">
          <div class="text-xs text-dimmed">Summary</div>
          <div class="text-sm">
            <span v-if="summary">{{ summary }}</span>
            <span v-else class="text-dimmed italic">missing</span>
          </div>
        </div>

        <div class="space-y-1">
          <div class="text-xs text-dimmed">Contact</div>
          <div class="text-sm">
            <span v-if="contactLine">{{ contactLine }}</span>
            <span v-else class="text-dimmed italic">missing</span>
          </div>
        </div>

        <div class="space-y-1">
          <div class="text-xs text-dimmed">Coverage</div>
          <div class="text-sm">
            <span v-if="coverageAreas">{{ coverageAreas }}</span>
            <span v-else class="text-dimmed italic">missing</span>
          </div>
        </div>

        <div class="space-y-1">
          <div class="text-xs text-dimmed">Website</div>
          <div class="text-sm">
            <span v-if="card.websiteUrl">{{ card.websiteUrl }}</span>
            <span v-else class="text-dimmed italic">missing</span>
          </div>
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { AgentCard } from '../../../../composables/fireux/firestore/profiles/Agent/utils/view/useAgentInterface';
import type { Agent } from '../../../../models/profiles/Agent/Agent.model';

const props = withDefaults(
  defineProps<{
    card: AgentCard.Card
    profile?: Agent | null
    prop?: string
    showSubtitle?: boolean
  }>(),
  {
    showSubtitle: true,
  }
)

const profile = computed(() => props.profile ?? null)
const summary = computed(() => String(props.prop || props.card.summary || '').trim())
const contactLine = computed(() =>
  [props.card.contactEmail, props.card.contactPhone].filter(Boolean).join(' · ')
)
const coverageAreas = computed(() => {
  const areas = profile.value?.agent_coverage_areas ?? []
  return Array.isArray(areas)
    ? areas.map((entry) => String(entry ?? '').trim()).filter(Boolean).join(', ')
    : ''
})
</script>
