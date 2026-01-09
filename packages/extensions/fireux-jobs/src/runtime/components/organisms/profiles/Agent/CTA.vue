<template>
  <UPageCTA
    title="Agent profile"
    description="Add an agent profile to your FireUX portfolio so talent knows who is hiring."
    variant="naked"
  >
    <template #default>
      <div v-if="!hasAgentProfile" class="space-y-2">
        <OrganismsProfilesAgentCreateSystem />
      </div>

      <div v-else class="space-y-4">
        <div class="flex justify-end">
          <div v-if="canToggle" class="flex items-center gap-2">
            <UButton size="xs" variant="ghost" @click="toggleCompact">
              {{ variant === 'pill' ? 'Cells' : 'Pills' }}
            </UButton>
            <UButton size="xs" variant="ghost" @click="toggleDetail">
              {{ variant === 'preview' ? 'Profile' : 'Preview' }}
            </UButton>
          </div>
        </div>

        <div class="space-y-4">
          <OrganismsProfilesAgentCardsPreview
            v-if="variant === 'preview' && profileCard"
            :card="profileCard"
          />
          <OrganismsProfilesAgentCardsProfile
            v-else-if="variant === 'profile' && profileCard"
            v-bind="profileCard"
          />
          <OrganismsProfilesAgentCardsCell
            v-else-if="variant === 'cell' && profileCard"
            v-bind="profileCard"
          />
          <OrganismsProfilesAgentCardsPill v-else-if="profileCard" v-bind="profileCard" />
          <p v-else class="text-sm text-slate-500">No agent profile loaded.</p>
        </div>
      </div>
    </template>
  </UPageCTA>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser.ts'
import { useAgent } from '../../../../composables/fireux/firestore/profiles/Agent/useAgent.ts'

const { coreProfile, card } = useAgent()
const { hasProfile } = useUser()

const hasAgentProfile = computed(() => hasProfile('agent'))

const profileCard = computed(() => (coreProfile.value ? card(coreProfile.value) : null))

const canToggle = computed(() => Boolean(profileCard.value))
type Variant = 'pill' | 'cell' | 'preview' | 'profile'
const variant = ref<Variant>('pill')

const toggleCompact = () => {
  if (!canToggle.value) return
  variant.value = variant.value === 'pill' ? 'cell' : 'pill'
}

const toggleDetail = () => {
  if (!canToggle.value) return
  variant.value = variant.value === 'preview' ? 'profile' : 'preview'
}

watch(canToggle, (enabled: boolean) => {
  if (!enabled) variant.value = 'pill'
})
</script>

