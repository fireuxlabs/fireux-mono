<template>
  <UCard class="space-y-4">
    <div class="flex items-start gap-3">
      <UAvatar :src="vm.avatar || undefined" :alt="vm.title" size="sm" />

      <div class="min-w-0 flex-1 space-y-1">
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <div class="truncate font-medium">{{ vm.title }}</div>
            <div v-if="vm.subtitle" class="truncate text-sm text-dimmed">{{ vm.subtitle }}</div>
          </div>

          <div v-if="vm.badges.length" class="flex flex-wrap justify-end gap-1">
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
        </div>

        <div class="space-y-1">
          <div class="text-sm">
            <span v-if="vm.line1">{{ vm.line1 }}</span>
            <span v-else class="text-dimmed italic">missing</span>
          </div>
          <div class="text-sm text-dimmed">
            <span v-if="vm.line2">{{ vm.line2 }}</span>
            <span v-else class="italic">missing</span>
          </div>
        </div>
      </div>
    </div>
  </UCard>
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
  prop?: string
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

  const line1 = String((typeof props.prop === 'string' ? props.prop : card?.line1) ?? '').trim()
  const line2 = String(card?.line2 ?? '').trim()

  return { title, subtitle, avatar, badges, line1, line2 }
})
</script>
