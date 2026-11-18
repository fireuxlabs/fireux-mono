<template>
  <UPageCard
    v-if="item"
    :title="item.label"
    :to="linkArea === 'card' ? item.to : undefined"
    :icon="item.icon"
  >
    <template v-if="linkArea === 'title'" #title>
      <NuxtLink :to="item.to">{{ item.label }}</NuxtLink>
    </template>
    <slot />
  </UPageCard>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { useNav } from 'fireux-core/runtime/composables/navigation/useNav'
const props = withDefaults(
  defineProps<{
    navKey: string
    childKey: string
    linkArea?: 'card' | 'title'
  }>(),
  { linkArea: 'card' }
)
const navigation = useNav(['workspace'])
const item = computed(() =>
  navigation.items.value
    .find((group) => group.key === props.navKey)
    ?.children?.find((child) => child.key === props.childKey)
)
</script>
