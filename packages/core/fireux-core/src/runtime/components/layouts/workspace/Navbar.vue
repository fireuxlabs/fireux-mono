<template>
  <div class="relative isolate overflow-hidden bg-default">
    <component :is="identityComponent" v-if="identityComponent" backdrop-only />
    <LayoutsDashboardNavbar
      class="relative z-10 bg-transparent"
      :title="title"
      :ui="ui"
      :show-title="identityComponent ? true : showTitle"
      :show-subscription="false"
      show-notifications
    >
      <template #title>
        <div class="flex min-w-0 items-center gap-3">
          <component
            :is="identityComponent"
            v-if="identityComponent"
            identity-only
          />
          <span
            :class="
              identityComponent
                ? 'hidden truncate text-sm text-muted md:inline'
                : ''
            "
          >
            <slot name="title">{{ title }}</slot>
          </span>
        </div>
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
            :disabled="!mounted || !pageState"
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
  </div>

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
import { computed, onMounted, ref } from 'vue'
import { useNuxtApp, useToast } from '#imports'
import { toWorkspaceFamilyLabel } from '../../../composables/fireux/workspace/workspaceRoutes'
import { useWorkspaceNav } from '../../../composables/fireux/workspace/useWorkspaceNav'
import { useWorkspacePageState } from '../../../composables/fireux/workspace/useWorkspacePageState'

defineProps<{
  title: string
  ui?: any
  showTitle?: boolean
}>()

const workspaceNav = useWorkspaceNav()
const nuxtApp = useNuxtApp()
const identityComponent = computed(() =>
  nuxtApp.vueApp.component(
    `Workspace${toWorkspaceFamilyLabel(workspaceNav.currentWorkspace.value)}Navigation`
  )
)
const toast = useToast()
const infoOpen = ref(false)
const copyingPageJson = ref(false)
const mounted = ref(false)
onMounted(() => { mounted.value = true })
const { state: pageState, copy } = useWorkspacePageState(
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
    await copy()
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
