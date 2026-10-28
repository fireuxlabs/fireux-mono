<template>
  <div class="workspace-navbar">
    <component :is="identityComponent" v-if="identityComponent" backdrop-only />
    <UDashboardNavbar class="workspace-navbar__bar" :title="title">
      <template #leading>
        <UDashboardSidebarCollapse class="workspace-navbar__sidebar-toggle" />
      </template>
      <template #title>
        <div class="workspace-navbar__identity">
          <component
            :is="identityComponent"
            v-if="identityComponent"
            identity-only
          />
          <span v-if="!identityComponent">
            {{ title }}
          </span>
        </div>
      </template>

      <template #right>
        <div class="workspace-navbar__actions">
          <span
            v-if="identityComponent"
            class="workspace-navbar__page-title fx-type-caption"
          >
            {{ title }}
          </span>
          <UserSubscriptionControl always-visible />
          <UButton
            icon="i-lucide-info"
            color="neutral"
            variant="ghost"
            aria-label="About this page"
            @click="infoOpen = true"
          />
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
          <UserNotificationsButton />
        </div>
      </template>
    </UDashboardNavbar>
  </div>

  <UModal
    v-model:open="infoOpen"
    :title="title"
    description="About this Workspace page."
  >
    <template #body>
      <div class="workspace-surface workspace-surface--compact">
        <p class="fx-type-caption">
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
import { toWorkspaceFamilyLabel } from '../utils/routes'
import { useWorkspaceNav } from '../composables/useWorkspaceNav'
import { useWorkspacePageState } from '../composables/useWorkspacePageState'

defineProps<{
  title: string
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
onMounted(() => {
  mounted.value = true
})
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
