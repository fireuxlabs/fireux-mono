<template>
  <component
    :is="link && to ? 'NuxtLink' : 'div'"
    :to="link && to ? to : undefined"
    @click="onClick"
    class="pill"
  >
    <UUser
      :name="displayName"
      :description="showSubtitle ? (title || undefined) : undefined"
      size="sm"
    >
      <template #avatar>
        <UAvatar :src="image || avatarUrl || undefined" :alt="displayName || ''" size="xs" />
      </template>
    </UUser>
  </component>
</template>

<script setup lang="ts">
import type { ProfessionalCard } from '../../../../../composables/fireux/firestore/profiles/Professional/utils/view/useProfessionalInterface';

const emit = defineEmits<{
  (event: 'action'): void
}>()

const props = withDefaults(
  defineProps<
    Pick<ProfessionalCard.Card, 'to' | 'avatarUrl' | 'image' | 'displayName' | 'title'> & {
      showSubtitle?: boolean
      link?: boolean
      action?: boolean
    }
  >(),
  {
    showSubtitle: true,
    link: false,
    action: false,
  }
)

const onClick = () => {
  if (props.action) emit('action')
}
</script>
