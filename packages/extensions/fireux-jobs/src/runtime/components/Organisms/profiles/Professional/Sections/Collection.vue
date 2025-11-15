<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between gap-2">
        <h2>{{ title }}</h2>
        <UBadge variant="soft">{{ total }} total</UBadge>
      </div>
      <p v-if="description" class="text-sm opacity-70">
        {{ description }}
      </p>
    </template>

    <div v-if="pills.length" class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <OrganismsProfilesProfessionalCardsPill
        v-for="pill in pills"
        :key="pillKey(pill)"
        :professional="pill"
      />
    </div>
    <p v-else class="text-sm opacity-70">
      No professionals found in this environment.
    </p>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { User } from 'fireux-core/runtime/models/core/user.model.ts'
import type {
  ProfessionalProfile,
  ProfessionalCard,
} from '../../../../../models/profiles/Professional.model.ts'
import { useProfessional } from '../../../../../composables/firestore/profiles/Professional/useProfessional.ts'
import { useProfessionalCollection } from '../../../../../composables/firestore/profiles/Professional/main/useProfessionalCollection.ts'

const props = withDefaults(
  defineProps<{ title?: string; description?: string }>(),
  {
    title: 'Professional Directory',
    description: '',
  }
)

const { pillForUser } = useProfessional()
const { professionals } = useProfessionalCollection()

const pills = computed(() => {
  const entries = professionals.value ?? []
  return entries
    .map((entry: ProfessionalProfile) => {
      const user = entry?.user as User | undefined
      if (!user) return null
      return pillForUser(user, entry)
    })
    .filter((pill): pill is ProfessionalCard.Pill => pill !== null)
})

const total = computed(() => pills.value.length)

const pillKey = (pill: ProfessionalCard.Pill) =>
  `${pill.title ?? ''}-${pill.subtitle ?? ''}-${pill.to ?? ''}`

const title = computed(() => props.title)
const description = computed(() => props.description)
</script>
