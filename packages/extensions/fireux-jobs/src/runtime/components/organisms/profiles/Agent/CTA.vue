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
          <UButton v-if="canToggle" size="xs" variant="ghost" @click="toggleView">
            {{ showCellView ? 'Show pill' : 'Show cell' }}
          </UButton>
        </div>

        <div class="space-y-4">
          <OrganismsProfilesAgentCardsCell v-if="showCellCard && cell" :agent="cell" />
          <OrganismsProfilesAgentCardsPill v-else-if="pill" :agent="pill" />
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

const { pill, cell } = useAgent()
const { hasProfile } = useUser()

const hasAgentProfile = computed(() => hasProfile('agent'))

const canToggle = computed(() => Boolean(cell.value))
const showCellView = ref(false)
const showCellCard = computed(() => canToggle.value && showCellView.value)
const toggleView = () => {
  if (!canToggle.value) return
  showCellView.value = !showCellView.value
}

watch(canToggle, (enabled: boolean) => {
  if (!enabled) showCellView.value = false
})
</script>

