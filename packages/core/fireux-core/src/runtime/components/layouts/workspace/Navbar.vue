<template>
  <LayoutsDashboardNavbar
    :title="title"
    :ui="ui"
    :show-title="showTitle"
    :show-subscription="false"
    show-notifications
  >
    <template #title>
      <slot name="title">{{ title }}</slot>
    </template>

    <template #right>
      <div class="flex items-center gap-2">
        <UserSubscriptionControl always-visible />
        <slot name="right">
          <UButton
            icon="i-lucide-info"
            color="neutral"
            variant="ghost"
            aria-label="About this page"
            @click="infoOpen = true"
          />
        </slot>
        <UButton
          icon="i-lucide-braces"
          color="neutral"
          variant="ghost"
          aria-label="Copy page JSON"
          :disabled="!pageState"
          :loading="copyingPageJson"
          @click="copyPageJson"
        />
        <UButton
          v-if="calendarTo"
          :to="calendarTo"
          icon="i-lucide-calendar-range"
          color="neutral"
          variant="ghost"
          aria-label="Open Calendar"
        />
      </div>
    </template>
  </LayoutsDashboardNavbar>

  <UModal
    v-model:open="infoOpen"
    :title="title"
    description="About this Workspace page."
  >
    <template #body>
      <div class="grid gap-5">
        <p class="m-0 text-sm text-toned">
          This page works with the active Workspace and its selected Entity.
          Available information and actions still follow that Entity's access
          and capability authority.
        </p>
        <WorkspaceCapabilityInfo />
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useToast } from '#imports'
import { useWorkspaceNav } from '../../../composables/fireux/workspace/useWorkspaceNav'
import { useWorkspacePageState } from '../../../composables/fireux/workspace/useWorkspacePageState'

defineProps<{
  title: string
  ui?: any
  showTitle?: boolean
}>()

const workspaceNav = useWorkspaceNav()
const route = useRoute()
const toast = useToast()
const infoOpen = ref(false)
const copyingPageJson = ref(false)
const { state: pageState } = useWorkspacePageState(
  workspaceNav.currentWorkspace.value
)
const calendarTo = computed(
  () =>
    workspaceNav.items.value.find((item) =>
      /\/calendar\/?$/.test(String(item.to || ''))
    )?.to || ''
)

async function copyPageJson() {
  if (!pageState.value || copyingPageJson.value) return
  copyingPageJson.value = true
  try {
    await navigator.clipboard.writeText(
      JSON.stringify(
        {
          page: {
            path: route.path,
            workspace: workspaceNav.currentWorkspace.value,
          },
          state: pageState.value,
        },
        null,
        2
      )
    )
    toast.add({
      title: 'Page JSON copied',
      description: 'Only the published page runtime state was copied.',
      icon: 'i-lucide-clipboard-check',
      color: 'success',
    })
  } catch {
    toast.add({
      title: 'Copy failed',
      description: 'The browser did not allow clipboard access.',
      icon: 'i-lucide-circle-alert',
      color: 'error',
    })
  } finally {
    copyingPageJson.value = false
  }
}
</script>
