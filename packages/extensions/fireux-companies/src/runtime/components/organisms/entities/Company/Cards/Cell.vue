<template>
  <component
    :is="link && to ? 'NuxtLink' : 'div'"
    :to="link && to ? to : undefined"
    class="fx-cell"
    @click="onClick"
  >
    <div class="fx-cell__media">
      <UAvatar
        :src="avatarUrl || undefined"
        :alt="name"
        size="sm"
        :class="avatarUrl ? 'bg-white dark:bg-white' : ''"
      />

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
  </component>
</template>

<script setup lang="ts">
import type { CompanyCard } from '../../../../../composables/fireux/firestore/objects/company/utils/view/useCompanyInterface'

type Props = Pick<CompanyCard.Card, 'to' | 'name' | 'website' | 'badges'> & {
  prop?: string
  avatarUrl?: string
  showSubtitle?: boolean
  showBadges?: boolean
  showTagline?: boolean
  link?: boolean
  action?: boolean

  // Back-compat with older callsites
  card?: Partial<CompanyCard.Card> | null
  avatar?: string | null
}

const emit = defineEmits<{
  (event: 'action'): void
}>()

const props = withDefaults(defineProps<Props>(), {
  avatarUrl: '',
  prop: '',
  showSubtitle: true,
  showBadges: true,
  showTagline: true,
  link: false,
  action: false,

  card: null,
  avatar: null,
})

// Allow passing either structured props or a legacy `card` object.
const to = props.to || props.card?.to || ''
const name = props.name || props.card?.name || ''
const website = props.website || props.card?.website || ''
const badges = props.badges.length ? props.badges : props.card?.badges || []
const avatarUrl = props.avatarUrl || props.card?.avatarUrl || props.avatar || ''

const onClick = () => {
  if (props.action) emit('action')
}
</script>
