<template>
  <section class="console-surface space-y-6">
    <ConsoleProjectIdentityRead />

    <ConsoleProjectIdentityWrite v-if="canWrite" />
  </section>
</template>

<script setup lang="ts">
import { useProjectConsoleIdentity } from '../../../../composables/fireux/console/project/Identity/useProjectConsoleIdentity'

const { canWrite } = useProjectConsoleIdentity()
</script>
