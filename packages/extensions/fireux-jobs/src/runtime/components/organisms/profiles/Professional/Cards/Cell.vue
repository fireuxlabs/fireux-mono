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
          <UAvatarGroup v-if="avatarUrl && secondaryAvatarUrl" size="xs">
            <UAvatar :src="avatarUrl || undefined" :alt="displayName" size="xs" />
            <UAvatar :src="secondaryAvatarUrl || undefined" :alt="displayName" size="2xs" />
          </UAvatarGroup>
          <UAvatar v-else :src="avatarUrl || undefined" :alt="displayName" size="xs" />
        </template>
      </UUser>

      <div class="card__content card__stack">
        <div v-if="locationsCsv" class="text-xs text-muted">
          Locations · {{ locationsCsv }}
        </div>
      </div>
    </div>
  </component>
</template>

<script setup lang="ts">
import type { ProfessionalCard } from '../../../../../composables/fireux/firestore/profiles/Professional/utils/view/useProfessionalInterface'

type Props = Pick<
  ProfessionalCard.Card,
  'to' | 'avatarUrl' | 'secondaryAvatarUrl' | 'displayName' | 'title' | 'locationsCsv'
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
