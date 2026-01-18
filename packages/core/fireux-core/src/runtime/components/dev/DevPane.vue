<template>
    <Pane v-bind="$attrs">
      <slot />
      <template #actions>
        <slot name="actions" />
      </template>
      <template #header>
        <slot name="header" />
      </template>
    </Pane>
</template>

<script setup lang="ts">
import Pane from './Pane.vue';

defineOptions({ name: 'DevPane' })
</script>
