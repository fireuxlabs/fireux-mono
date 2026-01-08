<template>
  <div class="space-y-2">
    <UCard v-if="isTenant">
      <template #header>
        <div class="flex items-center justify-between gap-2">
          <h2>App agents</h2>
          <UBadge variant="soft">{{ localTotal }} total</UBadge>
        </div>
        <p class="text-sm opacity-70">Agents scoped to this tenant application.</p>
      </template>

      <OrganismsProfilesAgentCollectionList
        v-if="localCards.length"
        :cards="localCards"
        variant="pill"
      />

      <p v-else class="text-sm opacity-70">No tenant-scoped agents found.</p>
    </UCard>

    <section class="space-y-2">
      <div v-if="isTenant" class="flex items-center justify-end">
        <UButton variant="ghost" @click="showGlobalDirectory = !showGlobalDirectory">
          {{ showGlobalDirectory ? 'Hide global agents' : 'View global agents' }}
        </UButton>
      </div>

      <UCard v-if="showGlobalDirectory || !isTenant">
        <template #header>
          <div class="flex items-center justify-between gap-2">
            <h2>Global agents</h2>
            <UBadge variant="soft">{{ globalTotal }} total</UBadge>
          </div>
          <p class="text-sm opacity-70">Agents available across the FireUX network.</p>
        </template>

        <OrganismsProfilesAgentCollectionList
          v-if="globalCards.length"
          :cards="globalCards"
          variant="pill"
        />

        <p v-else class="text-sm opacity-70">No global agents found.</p>
      </UCard>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import type { AgentCore } from '../../../../../models/profiles/Agent/Agent.model'
import { useAgentCollection } from '../../../../../composables/fireux/firestore/profiles/Agent/main/useAgentCollection'
import { useAgent } from '../../../../../composables/fireux/firestore/profiles/Agent/useAgent'
import type { AgentCard } from '../../../../../composables/fireux/firestore/profiles/Agent/useAgent'

const { isTenant } = useFireUXConfig()
const showGlobalDirectory = ref(!isTenant)

const { globalAgents, localAgents } = useAgentCollection()
const { card } = useAgent()

type DirectoryEntry = {
  key: string
  card: AgentCard.Card
  raw: AgentCore
}

const globalDirectoryEntries = computed<DirectoryEntry[]>(() => {
  const list = globalAgents.value ?? []
  if (!list.length) return []

  return list
    .filter((entry: unknown): entry is AgentCore => Boolean((entry as AgentCore | undefined)?.id))
    .map((entry: AgentCore) => {
      const payload = card(entry)
      if (!payload) return null

      return {
        key: entry.id,
        card: payload,
        raw: entry,
      }
    })
    .filter((entry): entry is DirectoryEntry => Boolean(entry))
})

const localDirectoryEntries = computed<DirectoryEntry[]>(() => {
  const list = localAgents.value ?? []
  if (!list.length) return []

  return list
    .filter((entry: unknown): entry is AgentCore => Boolean((entry as AgentCore | undefined)?.id))
    .map((entry: AgentCore) => {
      const payload = card(entry)
      if (!payload) return null

      return {
        key: entry.id,
        card: payload,
        raw: entry,
      }
    })
    .filter((entry): entry is DirectoryEntry => Boolean(entry))
})

const globalCards = computed(() => globalDirectoryEntries.value.map((e) => e.card))
const localCards = computed(() => localDirectoryEntries.value.map((e) => e.card))

const globalTotal = computed(() => globalDirectoryEntries.value.length)
const localTotal = computed(() => localDirectoryEntries.value.length)
</script>
