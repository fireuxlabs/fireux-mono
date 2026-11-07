<template>
  <FireuxApp :manifest-path="manifestPath">
    <template v-if="showWorkspace" #default>
      <LazyWorkspace />
    </template>
  </FireuxApp>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from '#imports'
import { useFireUXConfig } from '../composables/config/FireUXConfig'
import { workspaceFamilyFromRouteContext } from '../../workspace/utils/routes'
import { useWorkspaceEntryCta } from '../../workspace/composables/useWorkspaceEntryCta'
const route = useRoute()
const config = useFireUXConfig()
const { homePath } = useWorkspaceEntryCta()
const showWorkspace = computed(() =>
  Boolean(config.workspaces.length && route.meta.workspacePage)
)
const manifestPath = computed(() => {
  const family = workspaceFamilyFromRouteContext(
    route.path,
    route.meta.workspace
  )
  const query =
    showWorkspace.value && family && config.workspaces.includes(family)
      ? `?surface=workspace&start_url=${encodeURIComponent(homePath(family))}`
      : ''
  return `/manifest.webmanifest${query}`
})
</script>
