<template>
  <section class="console-surface">
    <ConsoleProjectIdentityRead />

    <ConsoleProjectIdentityEdit v-if="canWrite" />
  </section>
</template>

<script setup lang="ts">
import { useProjectConsoleIdentity } from '../../../../composables/fireux/console/project/identity/useProjectConsoleIdentity'

const { canWrite } = useProjectConsoleIdentity()
</script>
