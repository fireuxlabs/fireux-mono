<template>
  <component
    :is="link && to ? 'NuxtLink' : 'div'"
    :to="link && to ? to : undefined"
    class="card card--cell"
    @click="onClick"
  >
    <div class="card__media">
      <UAvatarGroup v-if="secondaryAvatarUrl" size="sm">
        <UAvatar :src="avatarUrl || undefined" :alt="displayName" size="sm" />
        <UAvatar :src="secondaryAvatarUrl || undefined" :alt="displayName" size="2xs" />
      </UAvatarGroup>
      <UAvatar v-else :src="avatarUrl || undefined" :alt="displayName" size="sm" />

      <div class="card__content card__stack">
        <div class="card__header">
          <div class="min-w-0">
            <div class="card__title">{{ displayName }}</div>
            <div v-if="showSubtitle && title" class="card__subtitle">
              {{ title }}
            </div>
          </div>
        </div>

        <div v-if="showBody" class="card__tagline">
          <div v-if="prop || bioShort">
            {{ prop || bioShort }}
          </div>

          <div v-if="specialtiesCsv" class="text-dimmed">
            {{ specialtiesCsv }}
          </div>

          <div v-if="locationsCsv" class="text-dimmed">
            {{ locationsCsv }}
          </div>
        </div>
      </div>
    </div>
  </component>
</template>

<script setup lang="ts">
import type { ProfessionalCard } from '../../../../../composables/fireux/firestore/profiles/Professional/utils/view/useProfessionalInterface'

type Props = Pick<
  ProfessionalCard.Card,
  | 'to'
  | 'avatarUrl'
  | 'secondaryAvatarUrl'
  | 'displayName'
  | 'title'
  | 'bioShort'
  | 'specialtiesCsv'
  | 'locationsCsv'
> & {
  prop?: string
  showSubtitle?: boolean
  showBody?: boolean
  link?: boolean
  action?: boolean
}

const emit = defineEmits<{
  (event: 'action'): void
}>()

const props = withDefaults(defineProps<Props>(), {
  prop: '',
  showSubtitle: true,
  showBody: true,
  link: false,
  action: false,
})

const onClick = () => {
  if (props.action) emit('action')
}
</script>
