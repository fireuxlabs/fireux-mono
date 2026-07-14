<template>
  <div v-if="visible" class="min-w-0">
    <UBreadcrumb :items="items" />
  </div>
</template>

<script setup lang="ts">
import { toRef } from 'vue'
import { useBreadcrumbs } from '../../../composables/fireux/app/ui/nav/useBreadcrumbs'

const props = defineProps<{
  currentLabel?: string
}>()

const { items, visible } = useBreadcrumbs(toRef(props, 'currentLabel'))
</script>
