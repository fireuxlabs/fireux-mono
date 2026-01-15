<template>
  <NuxtLink :to="to" class="fx-cell">
    <div class="fx-cell__media">
      <UAvatar :src="avatarUrl || undefined" :alt="name" size="sm" />

      <div class="fx-cell__content fx-cell__stack">
        <div class="fx-cell__header">
          <div class="min-w-0">
            <div class="fx-cell__title">{{ name }}</div>
            <div v-if="showSubtitle && website" class="fx-cell__subtitle">
              {{ website }}
            </div>
          </div>

          <div v-if="showBadges && badges.length" class="fx-cell__badges">
            <UBadge
              v-for="badge in badges"
              :key="badge"
              variant="soft"
              color="neutral"
              size="xs"
            >
              {{ badge }}
            </UBadge>
          </div>
        </div>

        <div v-if="showTagline" class="fx-cell__tagline">
          <span v-if="prop">{{ prop }}</span>
          <span v-else class="italic">missing</span>
        </div>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import type { KitchenCard } from '../../../../../composables/fireux/firestore/objects/kitchen/utils/view/useKitchenInterface'

type Props = Pick<KitchenCard.Card, 'to' | 'name' | 'website' | 'badges'> & {
  prop?: string
  avatarUrl?: string
  showSubtitle?: boolean
  showBadges?: boolean
  showTagline?: boolean

  // Back-compat with older callsites
  card?: Partial<KitchenCard.Card> | null
  avatar?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  avatarUrl: '',
  prop: '',
  showSubtitle: true,
  showBadges: true,
  showTagline: true,

  card: null,
  avatar: null,
})

// Allow passing either structured props or a legacy `card` object.
const to = props.to || props.card?.to || ''
const name = props.name || props.card?.name || ''
const website = props.website || props.card?.website || ''
const badges = props.badges.length ? props.badges : props.card?.badges || []
const avatarUrl = props.avatarUrl || props.card?.avatarUrl || props.avatar || ''
</script>
