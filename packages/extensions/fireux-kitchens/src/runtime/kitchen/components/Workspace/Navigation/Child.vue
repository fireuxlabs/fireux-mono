<template>
  <UPageCard v-if="item" :title="item.label" :to="item.to" :icon="item.icon">
    <slot />
  </UPageCard>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { useNav } from 'fireux-core/runtime/composables/navigation/useNav'
const props = defineProps<{ navKey: string; childKey: string }>()
const navigation = useNav(['workspace'])
const item = computed(() =>
  navigation.items.value
    .find((group) => group.key === props.navKey)
    ?.children?.find((child) => child.key === props.childKey)
)
</script>
