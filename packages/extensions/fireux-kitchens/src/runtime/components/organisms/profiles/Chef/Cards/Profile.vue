<template>
  <UCard>
    <template #header>
      <div class="flex items-start justify-between gap-4">
        <div class="flex items-start gap-3">
          <UAvatarGroup v-if="vm.avatarSecondary" size="md">
            <UAvatar :src="vm.avatar || undefined" :alt="vm.title" size="md" />
            <UAvatar :src="vm.avatarSecondary || undefined" :alt="vm.title" size="xs" />
          </UAvatarGroup>
          <UAvatar v-else :src="vm.avatar || undefined" :alt="vm.title" size="md" />
          <div class="min-w-0">
            <div class="truncate text-base font-semibold">{{ vm.title }}</div>
            <div class="text-sm text-dimmed">
              <span v-if="vm.subtitle">{{ vm.subtitle }}</span>
              <span v-else class="italic">missing</span>
            </div>
          </div>
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
    </template>

    <div class="space-y-4">
      <div class="space-y-1">
        <div class="text-xs text-dimmed">Bio</div>
        <div class="text-sm">
          <span v-if="vm.line1">{{ vm.line1 }}</span>
          <span v-else class="text-dimmed italic">missing</span>
        </div>
      </div>

      <div class="space-y-1">
        <div class="text-xs text-dimmed">Specialties</div>
        <div class="text-sm">
          <span v-if="vm.line2">{{ vm.line2 }}</span>
          <span v-else class="text-dimmed italic">missing</span>
        </div>
      </div>

      <div class="space-y-1">
        <div class="text-xs text-dimmed">Locations</div>
        <div class="text-sm">
          <span v-if="vm.line3">{{ vm.line3 }}</span>
          <span v-else class="text-dimmed italic">missing</span>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { ChefCard, ChefCore } from '../../../../../composables/fireux/firestore/profiles/Chef/useChef';
import { useChef } from '../../../../../composables/fireux/firestore/profiles/Chef/useChef';

const props = defineProps<{
  title?: string
  subtitle?: string
  avatar?: string | null
  avatarSecondary?: string | null
  chef?: ChefCore | ChefCard.Card | null
  card?: ChefCard.Card | null
  prop?: string
}>()

const { coreProfile, card: toCard } = useChef()

const isChefCard = (value: unknown): value is ChefCard.Card => {
  if (!value || typeof value !== 'object') return false
  return 'displayName' in value && 'title' in value && 'badges' in value
}

const resolvedCard = computed<ChefCard.Card | null>(() => {
  if (props.card) return props.card

  const supplied = props.chef ?? null
  if (supplied) {
    return isChefCard(supplied) ? supplied : toCard(supplied as ChefCore)
  }

  return coreProfile.value ? toCard(coreProfile.value) : null
})

const vm = computed(() => {
  const card = resolvedCard.value

  const cardAny = card as ChefCard.Card & {
    title?: string
    subtitle?: string
    line1?: string
    line2?: string
    line3?: string
    avatar?: string | null
    avatarSecondary?: string | null
  }

  const title = props.title ?? cardAny?.displayName ?? cardAny?.title ?? 'Chef'
  const subtitle = props.subtitle ?? (cardAny?.title || cardAny?.subtitle || undefined)
  const avatar = props.avatar ?? (cardAny?.avatarUrl || cardAny?.avatar || null)
  const avatarSecondary =
    props.avatarSecondary ?? (cardAny?.secondaryAvatarUrl || cardAny?.avatarSecondary || null)
  const badges = card?.badges ?? []

  const line1 = String(
    (typeof props.prop === 'string' ? props.prop : cardAny?.summary || cardAny?.line1) ?? ''
  ).trim()
  const line2 = String((cardAny?.specialtiesCsv || cardAny?.line2) ?? '').trim()
  const line3 = String((cardAny?.locationsCsv || cardAny?.line3) ?? '').trim()

  return { title, subtitle, avatar, avatarSecondary, badges, line1, line2, line3 }
})
</script>
