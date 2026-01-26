<template>
  <UCard>
    <template #header>
      <OrganismsProfilesProfessionalCardsCell v-bind="card" />
    </template>

    <div>
      <div v-if="prop">
        {{ prop }}
      </div>

      <div>
        <div>Bio</div>
        <div>
          <span v-if="prop || bioShort">{{ prop || bioShort }}</span>
          <span v-else>missing</span>
        </div>
      </div>

      <div>
        <div>Specialties</div>
        <div>
          <span v-if="specialties">{{ specialties }}</span>
          <span v-else>missing</span>
        </div>
      </div>

      <div>
        <div>Locations</div>
        <div>
          <span v-if="locations">{{ locations }}</span>
          <span v-else>missing</span>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { reactive, toRefs, watchEffect } from 'vue';
import type { ProfessionalCard } from '../../../../../composables/fireux/firestore/profiles/Professional/useProfessional';

const props = defineProps<{ card: ProfessionalCard.Card; prop?: string }>()

const card = reactive({ ...props.card })

watchEffect(() => {
  Object.assign(card, props.card)
})

const { prop } = toRefs(props)
const { avatarUrl, displayName, tagline, badges, bioShort, specialties, locations } = toRefs(card)
</script>
