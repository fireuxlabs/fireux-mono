<template>
  <div class="space-y-2">
    <UCard v-if="isTenant">
      <template #header>
        <div class="flex items-center justify-between gap-2">
          <h2>App agents</h2>
          <div class="flex items-center gap-2">
            <UInput
              v-model="query"
              size="xs"
              placeholder="Search…"
              class="w-44"
            />

            <UButton size="xs" variant="ghost" @click="toggleCompactVariant">
              {{ variant === 'pill' ? 'Cells' : 'Pills' }}
            </UButton>

            <UBadge variant="soft">{{ localTotal }} total</UBadge>
          </div>
        </div>
        <p class="text-sm opacity-70">Agents scoped to this tenant application.</p>
      </template>

      <OrganismsProfilesAgentCollectionList
        v-if="localCards.length"
        :cards="localCards"
        :variant="variant"
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
            <div class="flex items-center gap-2">
              <UInput
                v-model="query"
                size="xs"
                placeholder="Search…"
                class="w-44"
              />

              <UButton size="xs" variant="ghost" @click="toggleCompactVariant">
                {{ variant === 'pill' ? 'Cells' : 'Pills' }}
              </UButton>

              <UBadge variant="soft">{{ globalTotal }} total</UBadge>
            </div>
          </div>
          <p class="text-sm opacity-70">Agents available across the FireUX network.</p>
        </template>

        <OrganismsProfilesAgentCollectionList
          v-if="globalCards.length"
          :cards="globalCards"
          :variant="variant"
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
import type { AgentCard } from '../../../../../composables/fireux/firestore/profiles/Agent/useAgent'
import {
  useAgentsInterface,
  type AgentDirectoryEntry,
} from '../../../../../composables/fireux/firestore/profiles/Agent/utils/view/useAgentsInterface'

const { isTenant } = useFireUXConfig()
const showGlobalDirectory = ref(!isTenant)

type Variant = 'pill' | 'cell'
const variant = ref<Variant>('pill')
const query = ref('')

const toggleCompactVariant = () => {
  if (variant.value === 'pill') variant.value = 'cell'
  else variant.value = 'pill'
}

const { globalAgents, localAgents } = useAgentCollection()
const { card, searchText } = useAgentsInterface()

type DirectoryEntry = {
  key: string
  card: AgentCard.Card
  raw: AgentCore
}

const globalDirectoryEntries = computed<DirectoryEntry[]>(() => {
  const q = query.value.trim().toLowerCase()
  const list = (globalAgents.value ?? []) as AgentDirectoryEntry[]
  if (!list.length) return []

  return list
    .filter((entry) => Boolean(entry?.id))
    .filter((entry) => (!q ? true : searchText(entry).includes(q)))
    .map((entry) => {
      const payload = card(entry)

      return {
        key: entry.id,
        card: payload,
        raw: entry as unknown as AgentCore,
      }
    })
})

const localDirectoryEntries = computed<DirectoryEntry[]>(() => {
  const q = query.value.trim().toLowerCase()
  const list = (localAgents.value ?? []) as AgentDirectoryEntry[]
  if (!list.length) return []

  return list
    .filter((entry) => Boolean(entry?.id))
    .filter((entry) => (!q ? true : searchText(entry).includes(q)))
    .map((entry) => {
      const payload = card(entry)

      return {
        key: entry.id,
        card: payload,
        raw: entry as unknown as AgentCore,
      }
    })
})

const globalCards = computed(() => globalDirectoryEntries.value.map((e) => e.card))
const localCards = computed(() => localDirectoryEntries.value.map((e) => e.card))

const globalTotal = computed(() => globalDirectoryEntries.value.length)
const localTotal = computed(() => localDirectoryEntries.value.length)
</script>
