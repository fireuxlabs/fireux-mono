<template>
  <div class="mx-auto w-full max-w-3xl space-y-4">
    <ProfilesChefCardsCell
      v-bind="card"
      :show-tagline="true"
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
          <div class="text-xs text-dimmed">Signature dishes</div>
          <div class="text-sm">
            <span v-if="specialties">{{ specialties }}</span>
            <span v-else class="text-dimmed italic">missing</span>
          </div>
        </div>

        <div class="space-y-1">
          <div class="text-xs text-dimmed">Locations</div>
          <div class="text-sm">
            <span v-if="locations">{{ locations }}</span>
            <span v-else class="text-dimmed italic">missing</span>
          </div>
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { ChefCard } from '../../../../../composables/fireux/firestore/profiles/Chef/utils/view/useChefInterface';
import type { ChefCore } from '../../../../../models/profiles/Chef/Chef.model';

const props = defineProps<{
  card: ChefCard.Card
  profile?: ChefCore | null
  prop?: string
}>()

const profile = computed(() => props.profile ?? null)
const summary = computed(() => String(props.prop || props.card.summary || '').trim())
const specialties = computed(() => {
  const values = profile.value?.chef_signature_dishes?.length
    ? profile.value?.chef_signature_dishes
    : profile.value?.specialties ?? []

  return Array.isArray(values)
    ? values.map((entry) => String(entry ?? '').trim()).filter(Boolean).join(', ')
    : ''
})
const locations = computed(() => {
  const values = profile.value?.locations ?? []
  return Array.isArray(values)
    ? values.map((entry) => String(entry ?? '').trim()).filter(Boolean).join(', ')
    : ''
})
</script>
