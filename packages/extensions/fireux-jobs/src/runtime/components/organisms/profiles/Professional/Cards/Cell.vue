<template>
  <component
    :is="link && to ? 'NuxtLink' : 'div'"
    :to="link && to ? to : undefined"
    class="card card--cell"
    @click="onClick"
  >
    <div class="card__media">
      <UUser
        :name="displayName"
        :description="showSubtitle ? (title || undefined) : undefined"
        size="sm"
      >
        <template #avatar>
          <UAvatar :src="image || avatarUrl || undefined" :alt="displayName" size="xs" />
        </template>
      </UUser>

      <div class="card__content card__stack">
        <div v-if="showTagline && (prop || summary)" class="text-xs text-muted">
          {{ prop || summary }}
        </div>
      </div>
    </div>
  </component>
</template>

<script setup lang="ts">
import type { ProfessionalCard } from '../../../../../composables/fireux/firestore/profiles/Professional/utils/view/useProfessionalInterface'

type Props = Pick<
  ProfessionalCard.Card,
  'to' | 'avatarUrl' | 'image' | 'displayName' | 'title' | 'summary'
> & {
  prop?: string
  showSubtitle?: boolean
  showTagline?: boolean
  link?: boolean
  action?: boolean
}

const emit = defineEmits<{
  (event: 'action'): void
}>()

const props = withDefaults(defineProps<Props>(), {
  prop: '',
  showSubtitle: true,
  showTagline: true,
  link: false,
  action: false,
})

const onClick = () => {
  if (props.action) emit('action')
}
</script>
