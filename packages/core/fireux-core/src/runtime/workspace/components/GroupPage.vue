<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel :id="navKey">
      <template #header>
        <WorkspaceNavbar :title="pageTitle">
          <template v-if="$slots['header-right']" #right
            ><slot name="header-right"
          /></template>
        </WorkspaceNavbar>
      </template>
      <template #body>
        <section class="mx-auto grid w-full min-w-0 max-w-6xl gap-6">
          <UBreadcrumb :items="breadcrumbs" :ui="{ list: 'flex-wrap' }" />
          <p v-if="index?.description" class="text-sm text-muted">
            {{ index.description }}
          </p>
          <slot>
            <div
              :aria-label="`${index?.label || workspaceLabel} pages`"
              class="grid gap-4"
            >
              <UPageCard
                v-for="item in children"
                :key="item.key || item.to"
                :title="item.label"
                :to="item.to"
                :icon="item.icon || index?.icon"
              />
            </div>
          </slot>
          <UAlert
            v-if="notice"
            :title="notice"
            color="neutral"
            variant="subtle"
            icon="i-lucide-info"
          />
        </section>
      </template>
    </UDashboardPanel>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { useNav } from '../../composables/navigation/useNav'
import { useWorkspaceEntryCta } from '../composables/useWorkspaceEntryCta'
import { toWorkspaceFamilyLabel } from '../utils/routes'

const props = defineProps<{
  workspace: string
  navKey: string
  title?: string
  parentNavKey?: string
  notice?: string
}>()
const navigation = useNav(['workspace'])
const { workspaceEntryPath } = useWorkspaceEntryCta(props.workspace)
const workspaceLabel = computed(() => toWorkspaceFamilyLabel(props.workspace))
const index = computed(() =>
  navigation.items.value.find((item) => item.key === props.navKey)
)
const pageTitle = computed(
  () => props.title || index.value?.label || workspaceLabel.value
)
const parent = computed(() =>
  navigation.items.value.find((item) => item.key === props.parentNavKey)
)
const children = computed(() => index.value?.children || [])
const breadcrumbs = computed(() => {
  const overview = navigation.items.value.find(
    (item) => item.key === `workspace-${props.workspace}-overview`
  )
  return [
    { label: 'Home', to: workspaceEntryPath.value },
    ...(overview && overview.to !== index.value?.to
      ? [{ label: overview.label, to: overview.to }]
      : []),
    ...(parent.value
      ? [{ label: parent.value.label, to: parent.value.to }]
      : []),
    { label: pageTitle.value },
  ]
})
</script>
