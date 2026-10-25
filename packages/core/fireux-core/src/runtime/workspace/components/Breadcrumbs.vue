<template>
  <UBreadcrumb class="workspace-page__breadcrumbs" :items="breadcrumbs" />
</template>
<script setup lang="ts">
import { useWorkspacePageNavigation } from '../composables/useWorkspacePageNavigation'
const { breadcrumbs } = useWorkspacePageNavigation()
</script>
