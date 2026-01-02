<template>
  <NuxtLink
    :to="vmTo"
    class="fx-pill"
  >
    <UAvatar :src="vmAvatar || undefined" :alt="vmTitle" size="xs" />

    <div class="min-w-0 flex-1">
      <div class="min-w-0 truncate text-sm font-medium">{{ vmTitle }}</div>
      <div v-if="vmSubtitle" class="min-w-0 truncate text-xs text-dimmed">{{ vmSubtitle }}</div>
    </div>

    <div v-if="vmBadges.length" class="ml-2 flex shrink-0 items-center gap-1">
      <UBadge
        v-for="badge in vmBadges"
        :key="badge"
        variant="soft"
        color="neutral"
        size="xs"
      >
        {{ badge }}
      </UBadge>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAgent } from '../../../../../composables/fireux/firestore/profiles/Agent/useAgent'
import type { AgentCard, AgentProfile } from '../../../../../composables/fireux/firestore/profiles/Agent/useAgent'

const props = defineProps<{
  title?: string
  subtitle?: string
  avatar?: string | null
  agent?: AgentProfile | AgentCard.Card | null
  card?: AgentCard.Card | null
}>()

const { coreProfile, card: toCard } = useAgent()

const isAgentCard = (value: unknown): value is AgentCard.Card => {
  if (!value || typeof value !== 'object') return false
  return 'to' in value && 'title' in value && 'badges' in value && 'line1' in value
}

const resolvedCard = computed<AgentCard.Card | null>(() => {
  if (props.card) return props.card

  const supplied = props.agent ?? null
  if (supplied) {
    return isAgentCard(supplied) ? supplied : toCard(supplied)
  }

  return coreProfile.value ? toCard(coreProfile.value) : null
})

const vm = computed(() => {
  const card = resolvedCard.value

  const title = props.title ?? card?.title ?? 'Agent'
  const subtitle = props.subtitle ?? (card?.subtitle || undefined)
  const avatar = props.avatar ?? (card?.avatar || null)
  const badges = card?.badges ?? []
  const to = card?.to || '#'

  return { title, subtitle, avatar, badges, to }
})

const vmTitle = computed(() => vm.value.title)
const vmSubtitle = computed(() => vm.value.subtitle)
const vmAvatar = computed(() => vm.value.avatar)
const vmBadges = computed(() => vm.value.badges)
const vmTo = computed(() => vm.value.to)
</script>
