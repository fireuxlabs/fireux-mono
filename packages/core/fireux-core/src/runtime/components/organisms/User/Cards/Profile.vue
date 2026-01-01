<template>
  <UCard>
    <template #header>
      <div class="flex items-start justify-between gap-4">
        <div class="flex items-start gap-3">
          <UAvatar :src="vmAvatar || undefined" :alt="vmTitle" size="md" />
          <div class="min-w-0">
            <div class="truncate text-base font-semibold">{{ vmTitle }}</div>
            <div class="text-sm text-dimmed">
              <span v-if="vmSubtitle">{{ vmSubtitle }}</span>
              <span v-else class="italic">missing</span>
            </div>
          </div>
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
    </template>

    <div class="space-y-4">
      <div class="space-y-1">
        <div class="text-xs text-dimmed">Email</div>
        <div class="text-sm">
          <span v-if="vmLine1">{{ vmLine1 }}</span>
          <span v-else class="text-dimmed italic">missing</span>
        </div>
      </div>

      <div class="space-y-1">
        <div class="text-xs text-dimmed">Bio</div>
        <div class="text-sm">
          <span v-if="vmLine2">{{ vmLine2 }}</span>
          <span v-else class="text-dimmed italic">missing</span>
        </div>
      </div>

      <div class="space-y-1">
        <div class="text-xs text-dimmed">Profiles</div>
        <div class="text-sm">
          <span v-if="vmLine3">{{ vmLine3 }}</span>
          <span v-else class="text-dimmed italic">missing</span>
        </div>
      </div>

      <div class="rounded border p-3">
        <div class="text-xs font-medium opacity-70">Details</div>

        <div class="mt-2 grid gap-2">
          <div class="flex items-center justify-between gap-3">
            <div class="text-xs opacity-70">User id</div>
            <div class="text-sm">
              <span v-if="resolvedUserId">{{ resolvedUserId }}</span>
              <span v-else class="opacity-50">missing</span>
            </div>
          </div>

          <div class="flex items-center justify-between gap-3">
            <div class="text-xs opacity-70">Created</div>
            <div class="text-sm">
              <span v-if="resolvedCreatedAt">set</span>
              <span v-else class="opacity-50">missing</span>
            </div>
          </div>

          <div class="flex items-center justify-between gap-3">
            <div class="text-xs opacity-70">Updated</div>
            <div class="text-sm">
              <span v-if="resolvedUpdatedAt">set</span>
              <span v-else class="opacity-50">missing</span>
            </div>
          </div>
        </div>
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

const resolvedUser = computed<User | null>(() => props.user ?? runtimeUser.value ?? null)

const resolvedCard = computed<UserCard.Card | null>(() => {
  if (props.card) return props.card
  const source = resolvedUser.value
  return source ? toCard(source) : null
})

const resolvedTitle = computed(() => resolvedCard.value?.title ?? 'User')
const resolvedSubtitle = computed(() => resolvedCard.value?.subtitle ?? undefined)
const resolvedAvatar = computed(() => resolvedCard.value?.avatar ?? null)
const resolvedBadges = computed(() => resolvedCard.value?.badges ?? [])

const resolvedLine1 = computed(() => {
  if (typeof props.prop === 'string') return props.prop
  return resolvedCard.value?.line1 ?? ''
})
const resolvedLine2 = computed(() => resolvedCard.value?.line2 ?? '')
const resolvedLine3 = computed(() => resolvedCard.value?.line3 ?? '')

const resolvedUserId = computed(() => String(resolvedUser.value?.id ?? '').trim())
const resolvedCreatedAt = computed(() => resolvedUser.value?.created_at ?? null)
const resolvedUpdatedAt = computed(() => resolvedUser.value?.updated_at ?? null)

const vmTitle = computed(() => props.title ?? resolvedTitle.value)
const vmSubtitle = computed(() => props.subtitle ?? resolvedSubtitle.value)
const vmAvatar = computed(() => props.avatar ?? resolvedAvatar.value)
const vmBadges = computed(() => resolvedBadges.value)
const vmLine1 = computed(() => String(resolvedLine1.value ?? '').trim())
const vmLine2 = computed(() => String(resolvedLine2.value ?? '').trim())
const vmLine3 = computed(() => String(resolvedLine3.value ?? '').trim())
</script>
