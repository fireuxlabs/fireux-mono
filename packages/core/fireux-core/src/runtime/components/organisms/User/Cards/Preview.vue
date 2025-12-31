<template>
  <UCard>
    <div class="flex items-center gap-3">
      <UAvatar :src="vmAvatar || undefined" :alt="vmTitle" size="sm" />
      <div class="min-w-0 flex-1">
        <div class="truncate font-medium">{{ vmTitle }}</div>
        <div v-if="vmSubtitle" class="truncate text-sm text-dimmed">
          {{ vmSubtitle }}
        </div>
        <div v-if="prop" class="truncate text-sm text-dimmed">{{ prop }}</div>
      </div>
    </div>
  </UCard>
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
  prop?: string
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

const vmTitle = computed(() => props.title ?? resolvedTitle.value)
const vmSubtitle = computed(() => props.subtitle ?? resolvedSubtitle.value)
const vmAvatar = computed(() => props.avatar ?? resolvedAvatar.value)
</script>
