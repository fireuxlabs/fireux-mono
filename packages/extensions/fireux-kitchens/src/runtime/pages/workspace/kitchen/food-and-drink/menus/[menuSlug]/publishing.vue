<!-- Concurrent edit — 2026-07-20 16:19 CEST — Extension Workspace Spine pass: move workspace access metadata to the route and classify its surface. -->
<template>
  <p role="status">Opening Menu…</p>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
import { useMenuRecordNavigation } from '../../../../../../kitchen/composables/workspace/menus/useMenuRecordNavigation'
const slug = useRouteParam('menuSlug')
const { openView } = useMenuRecordNavigation()
onMounted(() => openView(slug.value, 'publishing', true))

definePageMeta({
  layout: false,
  workspacePage: true,
  visibility: { modules: ['fireux-kitchens'] },
  requiresAuth: true,
  requiresSelection: true,
  nav: {
    key: 'workspace-kitchen-menu-publishing',
    label: 'Menu Publishing',
    icon: 'i-lucide-send',
    position: 'top',
    hidden: true,
    desktop: false,
    mobile: false,
    layouts: ['workspace'],
  },
})
</script>
