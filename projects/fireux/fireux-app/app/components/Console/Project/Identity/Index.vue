<template>
  <section class="console-surface space-y-6">
    <ConsoleProjectIdentityRead />

    <ConsoleProjectIdentityEdit v-if="canWrite" />
  </section>
</template>

<script setup lang="ts">
import { useProjectConsoleIdentity } from '../../../../composables/fireux/console/project/useProjectConsoleIdentity'

const { canWrite } = useProjectConsoleIdentity()
</script>
