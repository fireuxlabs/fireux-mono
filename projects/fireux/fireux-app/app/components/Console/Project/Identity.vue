<template>
  <section class="console-surface space-y-6">
    <OrganismsConsoleProjectIdentityRead />

    <OrganismsConsoleProjectIdentityWrite v-if="canWrite" />
  </section>
</template>

<script setup lang="ts">
import { useProjectConsoleIdentity } from '../../../composables/fireux/console/project/operations/useProjectConsoleIdentity'

const { canWrite } = useProjectConsoleIdentity()
</script>
