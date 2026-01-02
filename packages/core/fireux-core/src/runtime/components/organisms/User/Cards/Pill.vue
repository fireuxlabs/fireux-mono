<template>
  <NuxtLink
    :to="vmTo"
    class="fx-pill"
  >
    <UAvatar :src="vmAvatar || undefined" :alt="vmTitle" size="xs" />

    <div class="min-w-0 flex-1">
      <div class="min-w-0 truncate text-sm font-medium">{{ vmTitle }}</div>
      <div v-if="vmSubtitle" class="min-w-0 truncate text-xs text-dimmed">
        {{ vmSubtitle }}
      </div>
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
import type { User } from '../../../../models/core/user.model'
import type { UserCard } from '../../../../composables/fireux/firestore/core/user/utils/view/useUserInterface'
import { useUser } from '../../../../composables/fireux/firestore/core/user/useUser'

const props = defineProps<{
  title?: string
  subtitle?: string
  avatar?: string | null
  user?: User | null
  card?: UserCard.Card | null
}>()

const { user: runtimeUser, card: toCard } = useUser()

const resolvedCard = computed<UserCard.Card | null>(() => {
  if (props.card) return props.card
  const source = props.user ?? runtimeUser.value ?? null
  return source ? toCard(source) : null
})

const resolvedTitle = computed(() => resolvedCard.value?.title ?? 'User')
const resolvedSubtitle = computed(() => resolvedCard.value?.subtitle ?? undefined)
const resolvedAvatar = computed(() => resolvedCard.value?.avatar ?? null)
const resolvedBadges = computed(() => resolvedCard.value?.badges ?? [])
const resolvedTo = computed(() => resolvedCard.value?.to ?? '')

const vmTitle = computed(() => props.title ?? resolvedTitle.value)
const vmSubtitle = computed(() => props.subtitle ?? resolvedSubtitle.value)
const vmAvatar = computed(() => props.avatar ?? resolvedAvatar.value)
const vmBadges = computed(() => resolvedBadges.value)
const vmTo = computed(() => resolvedTo.value || '#')
</script>
