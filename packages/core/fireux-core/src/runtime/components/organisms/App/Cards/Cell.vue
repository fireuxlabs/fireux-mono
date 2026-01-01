<template>
  <NuxtLink
    :to="vmTo"
    class="block rounded-lg border border-[var(--ui-border)] px-4 py-3 transition-colors hover:bg-[var(--ui-bg-muted)]"
  >
    <div class="flex items-start gap-3">
      <UAvatar :src="vmAvatar || undefined" :alt="vmTitle" size="sm" />

      <div class="min-w-0 flex-1 space-y-1">
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <div class="truncate font-medium">{{ vmTitle }}</div>
            <div v-if="vmSubtitle" class="truncate text-sm text-dimmed">
              {{ vmSubtitle }}
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

        <div class="text-sm text-dimmed">
          <span v-if="vmLine1">{{ vmLine1 }}</span>
          <span v-else class="italic">missing</span>
        </div>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { App } from '../../../../models/core/app.model'
import type { AppCard } from '../../../../composables/fireux/firestore/core/app/utils/view/useAppInterface'
import { useApp } from '../../../../composables/fireux/firestore/core/app/useApp'

const props = defineProps<{
  title?: string
  subtitle?: string
  avatar?: string | null
  app?: App | null
  card?: AppCard.Card | null
  prop?: string
}>()

const { app: runtimeApp, card: toCard } = useApp()

const resolvedCard = computed<AppCard.Card | null>(() => {
  if (props.card) return props.card
  const source = props.app ?? runtimeApp.value ?? null
  return source ? toCard(source) : null
})

const resolvedTitle = computed(() => resolvedCard.value?.title ?? 'App')
const resolvedSubtitle = computed(() => resolvedCard.value?.subtitle ?? undefined)
const resolvedAvatar = computed(() => resolvedCard.value?.avatar ?? null)
const resolvedBadges = computed(() => resolvedCard.value?.badges ?? [])
const resolvedTo = computed(() => resolvedCard.value?.to ?? '')
const resolvedLine1 = computed(() => {
  if (typeof props.prop === 'string') return props.prop
  return resolvedCard.value?.line1 ?? ''
})

const vmTitle = computed(() => props.title ?? resolvedTitle.value)
const vmSubtitle = computed(() => props.subtitle ?? resolvedSubtitle.value)
const vmAvatar = computed(() => props.avatar ?? resolvedAvatar.value)
const vmBadges = computed(() => resolvedBadges.value)
const vmTo = computed(() => resolvedTo.value || '#')
const vmLine1 = computed(() => String(resolvedLine1.value ?? '').trim())
</script>
