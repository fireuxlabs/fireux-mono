<template>
  <UCard>
    <div class="flex items-center gap-3">
      <UAvatar :src="vmAvatar || undefined" :alt="vmTitle" size="sm" />
      <div class="min-w-0 flex-1">
        <div class="truncate font-medium">{{ vmTitle }}</div>
        <div v-if="vmSubtitle" class="truncate text-sm text-dimmed">{{ vmSubtitle }}</div>
        <div v-if="prop" class="truncate text-sm text-dimmed">{{ prop }}</div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { AgentProfile } from '../../../../../models/profiles/Agent/Agent.model'
import type { AgentCard } from '../../../../../composables/fireux/firestore/profiles/Agent/main/useAgentInterface'
import { resolveAgentCell } from '../../../../../composables/fireux/firestore/profiles/Agent/main/useAgentInterface'

const props = defineProps<{
  title?: string
  subtitle?: string
  avatar?: string | null
  agent?: AgentCard.AgentCell | AgentProfile | null
  prop?: string
}>()

const resolved = computed<AgentCard.AgentCell | null>(() => {
  const source = props.agent
  if (!source) return null
  if ('user' in source) return resolveAgentCell(source)
  return source as AgentCard.AgentCell
})

const resolvedTitle = computed(() => resolved.value?.title ?? 'Agent')
const resolvedSubtitle = computed(
  () => resolved.value?.tagline ?? resolved.value?.subtitle ?? undefined
)
const resolvedAvatar = computed(() => resolved.value?.avatar ?? null)

const vmTitle = computed(() => props.title ?? resolvedTitle.value)
const vmSubtitle = computed(() => props.subtitle ?? resolvedSubtitle.value)
const vmAvatar = computed(() => props.avatar ?? resolvedAvatar.value)
</script>
