<template><p role="status">Opening Menu…</p></template>
<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
import {
  useMenuRecordNavigation,
  type MenuRecordView,
} from '../../../composables/workspace/menus/useMenuRecordNavigation'
const props = defineProps<{ view: MenuRecordView }>()
const slug = useRouteParam('menuSlug')
const { openView } = useMenuRecordNavigation()
// A server redirect would discard the in-memory intent between requests.
onMounted(() => openView(slug.value, props.view, true))
</script>
