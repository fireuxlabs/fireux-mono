<template>
  <UPageSection
    :title="`Test simple ${entityLabel} objects`"
    :description="`Create, select, change and delete simple String values inside the ${entityLabel} Workspace.`"
    class="py-4 sm:py-4"
  />
</template>
<script setup lang="ts">
defineProps<{ entityLabel: string }>()
</script>
