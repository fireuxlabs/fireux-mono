<template>
  <component
    :is="link && to ? 'NuxtLink' : 'div'"
    :to="link && to ? to : undefined"
    @click="onClick"
    class="pill"
  >
    <UUser
      :name="title"
      :description="subtitle || undefined"
      size="sm"
    >
      <template #avatar>
        <UAvatar
          :src="avatarUrl || undefined"
          icon="i-lucide-store"
          size="xs"
        />
      </template>
    </UUser>
  </component>
</template>

<script setup lang="ts">
import type { SupplierCard } from '../../../../composables/fireux/firestore/profiles/Supplier/utils/view/useSupplierInterface'

type PillProps = Pick<SupplierCard.Card, 'to' | 'title' | 'subtitle' | 'avatarUrl'> & {
  link?: boolean
  action?: boolean
}

const emit = defineEmits<{
  (event: 'action'): void
}>()

const props = withDefaults(defineProps<PillProps>(), {
  link: false,
  action: false,
})

const onClick = () => {
  if (props.action) emit('action')
}
</script>
