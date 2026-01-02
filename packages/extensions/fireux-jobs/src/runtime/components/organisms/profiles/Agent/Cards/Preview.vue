<template>
  <UCard class="space-y-4">
    <div class="flex items-start gap-3">
      <UAvatar :src="vmAvatar || undefined" :alt="vmTitle" size="sm" />

      <div class="min-w-0 flex-1 space-y-1">
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <div class="truncate font-medium">{{ vmTitle }}</div>
            <div v-if="vmSubtitle" class="truncate text-sm text-dimmed">{{ vmSubtitle }}</div>
          </div>

          <div v-if="vmBadges.length" class="flex flex-wrap justify-end gap-1">
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
        </div>

        <div class="space-y-1">
          <div class="text-sm">
            <span v-if="vmLine1">{{ vmLine1 }}</span>
            <span v-else class="text-dimmed italic">missing</span>
          </div>
          <div class="text-sm text-dimmed">
            <span v-if="vmLine2">{{ vmLine2 }}</span>
            <span v-else class="italic">missing</span>
          </div>
        </div>
      </div>
    </div>
  </UCard>
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
  prop?: string
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

  const line1Source = typeof props.prop === 'string' ? props.prop : card?.line1 ?? ''
  const line1 = String(line1Source ?? '').trim()
  const line2 = String(card?.line2 ?? '').trim()

  return { title, subtitle, avatar, badges, line1, line2 }
})

const vmTitle = computed(() => vm.value.title)
const vmSubtitle = computed(() => vm.value.subtitle)
const vmAvatar = computed(() => vm.value.avatar)
const vmBadges = computed(() => vm.value.badges)
const vmLine1 = computed(() => vm.value.line1)
const vmLine2 = computed(() => vm.value.line2)
</script>
