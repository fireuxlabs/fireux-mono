<template>
  <NuxtLink
    :to="vm.to"
    class="fx-pill"
  >
    <UAvatar :src="vm.avatar || undefined" :alt="vm.title" size="xs" />

    <div class="min-w-0 flex-1">
      <div class="min-w-0 truncate text-sm font-medium">{{ vm.title }}</div>
      <div v-if="vm.subtitle" class="min-w-0 truncate text-xs text-dimmed">{{ vm.subtitle }}</div>
    </div>

    <div v-if="vm.badges.length" class="ml-2 flex shrink-0 items-center gap-1">
      <UBadge
        v-for="badge in vm.badges"
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
import { useChef } from '../../../../../composables/fireux/firestore/profiles/Chef/useChef'
import type { ChefCard, ChefCore } from '../../../../../composables/fireux/firestore/profiles/Chef/useChef'

const props = defineProps<{
  title?: string
  subtitle?: string
  avatar?: string | null
  chef?: ChefCore | ChefCard.Card | null
  card?: ChefCard.Card | null
}>()

const { coreProfile, card: toCard } = useChef()

const isChefCard = (value: unknown): value is ChefCard.Card => {
  if (!value || typeof value !== 'object') return false
  return 'to' in value && 'title' in value && 'badges' in value && 'line1' in value
}

const resolvedCard = computed<ChefCard.Card | null>(() => {
  if (props.card) return props.card

  const supplied = props.chef ?? null
  if (supplied) {
    return isChefCard(supplied) ? supplied : toCard(supplied)
  }

  return coreProfile.value ? toCard(coreProfile.value) : null
})

const vm = computed(() => {
  const card = resolvedCard.value

  const title = props.title ?? card?.title ?? 'Chef'
  const subtitle = props.subtitle ?? (card?.subtitle || undefined)
  const avatar = props.avatar ?? (card?.avatar || null)
  const badges = card?.badges ?? []
  const to = card?.to || '#'

  return { title, subtitle, avatar, badges, to }
})
</script>
