<template>
  <NuxtLink
  v-if="link && to"
  :to="to"
  class="card card--cell"
>
    <div class="card__media">
      <UAvatar :src="image || avatarUrl || undefined" :alt="displayName" size="sm" />

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
          <div v-if="prop || summary">
            {{ prop || summary }}
          </div>
        </div>
      </div>
    </div>
</NuxtLink>

<div
  v-else
  class="card card--cell"
  @click="onClick"
>
    <div class="card__media">
      <UAvatar :src="image || avatarUrl || undefined" :alt="displayName" size="sm" />

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
          <div v-if="prop || summary">
            {{ prop || summary }}
          </div>
        </div>
      </div>
    </div>
</div>
</template>

<script setup lang="ts">
import { navigateTo } from '#imports'

import type { ProfessionalCard } from '../../../../../composables/fireux/firestore/profiles/Professional/utils/view/useProfessionalInterface'

type Props = Pick<
  ProfessionalCard.Card,
  | 'to'
  | 'avatarUrl'
  | 'image'
  | 'displayName'
  | 'title'
  | 'summary'
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

const onClick = (event?: MouseEvent) => {
  if (props.action) {
    emit('action')
    return
  }

  if (!props.link || !props.to) return
  if (event?.currentTarget instanceof HTMLAnchorElement) return

  navigateTo(props.to)
}
</script>
