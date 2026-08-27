<template>
  <section class="grid gap-4" aria-label="Kitchen Workspace">
    <span v-if="isDev && showCollectionControls" style="color: hotpink">
      WorkspaceKitchenCollectionHeader
    </span>
    <div
      v-if="showCollectionControls"
      class="flex flex-wrap items-end justify-between gap-3"
    >
      <div class="grid gap-1">
        <h2
          id="my-kitchens-title"
          class="m-0 text-xl font-semibold text-highlighted"
        >
          {{ title }}
        </h2>
        <p class="m-0 text-sm text-muted">
          {{ description }}
        </p>
      </div>
    </div>

    <span v-if="isDev && showCollectionControls" style="color: hotpink">
      WorkspaceKitchenCollectionList
    </span>
    <div v-if="showCollectionControls" class="grid gap-3 md:grid-cols-2">
      <USkeleton
        v-if="workspace.targets.pending.value"
        class="h-28 rounded-xl"
        aria-label="Loading Kitchens"
      />

      <UAlert
        v-else-if="workspace.targets.outcome.value === 'error'"
        color="error"
        variant="subtle"
        title="Kitchens unavailable"
        description="Your Kitchens could not be loaded."
      >
        <template #actions>
          <UButton
            label="Try again"
            color="neutral"
            variant="soft"
            icon="i-lucide-refresh-cw"
            @click="workspace.targets.refresh()"
          />
        </template>
      </UAlert>

      <KitchenCardsCell
        v-for="item in otherKitchenCells"
        v-else
        :key="item.card.id"
        v-bind="item.card"
        :badges="kitchenBadges(item)"
        action
        @action="openKitchen(item)"
      />

      <Create
        v-if="showCreateCell"
        launcher="cell"
        :label="kitchenCells.length ? 'Add a Kitchen' : 'Find your Kitchen'"
        :description="createDescription"
        @created="createdKitchen"
      />

      <NuxtLink
        v-else-if="showUpgradeCell"
        to="/pricing"
        class="card card--cell fx-action-surface min-h-28 text-left"
      >
        <div class="card__media">
          <UAvatar icon="i-lucide-building-2" size="md" class="shrink-0" />
          <div class="card__content card__stack">
            <div class="card__title">Manage every Kitchen</div>
            <div class="card__subtitle">
              Upgrade to Business to switch freely and add Kitchens.
            </div>
          </div>
        </div>
      </NuxtLink>
    </div>

    <span v-if="isDev && changeRequestOpen" style="color: hotpink">
      WorkspaceKitchenCollectionChangeRequest
    </span>
    <UModal
      v-model:open="changeRequestOpen"
      title="Request Kitchen change"
      :description="changeRequestDescription"
    >
      <template #footer>
        <div class="flex w-full justify-end gap-2">
          <UButton
            label="Cancel"
            color="neutral"
            variant="ghost"
            @click="changeRequestOpen = false"
          />
          <UButton label="Request change" @click="confirmKitchenChange" />
        </div>
      </template>
    </UModal>

    <span v-if="isDev && mounted" style="color: hotpink">
      DevDebugPanel
    </span>
    <DevDebugPanel
      v-if="mounted"
      title="Kitchen collection debug"
      scope="workspace"
      object-origin="fetched"
      :objects="debugObjects"
      :derived="debugState"
      :default-open="false"
    />
  </section>
</template>

<script setup lang="ts">
import { computed, navigateTo, onMounted, ref } from '#imports'
import { useUser } from 'fireux-core/runtime/user/composables/useUser'
import { useKitchenWorkspace } from '../../composables/workspace/core/useKitchenWorkspace'
import { useKitchenInterface } from '../../composables/firestore/utils/view/useKitchenInterface'
import Create from './Create.vue'

const { appAccess, appAccessOutcome } = useUser()
const isDev = import.meta.dev
const workspace = useKitchenWorkspace()
const { workspaceTarget } = useKitchenInterface()
const mounted = ref(false)

onMounted(() => {
  mounted.value = true
})

const subscription = computed(() =>
  appAccessOutcome.value === 'ready' ? appAccess.value.subscription : 'free'
)
const canCreateMultiple = computed(() => subscription.value === 'business')
const kitchenCells = computed(() => {
  const cells = workspace.targets.kitchens.value.flatMap((kitchen) => {
    const projected = workspaceTarget(kitchen)
    if (!projected) return []
    const tagline = String(
      kitchen.tagline || kitchen.brand_tagline || ''
    ).trim()
    const card = { ...projected, prop: tagline }
    return [
      {
        card,
        complete: Boolean(card.name && card.prop && card.imageUrl),
      },
    ]
  })
  return cells.sort(
    (left: { card: { id: string } }, right: { card: { id: string } }) =>
      left.card.id.localeCompare(right.card.id)
  )
})
const otherKitchenCells = computed(() =>
  kitchenCells.value.filter(
    (item) => item.card.id !== workspace.selection.kitchenId.value
  )
)
const title = computed(() => {
  if (!kitchenCells.value.length) return 'Find your Kitchen'
  if (otherKitchenCells.value.length) return 'Other Kitchens'
  return 'Add a Kitchen'
})
const description = computed(() => {
  if (!kitchenCells.value.length) {
    return 'Search Misebox and Google, or continue with a name.'
  }
  if (otherKitchenCells.value.length)
    return 'Choose another Kitchen to work in.'
  return 'Business supports multiple Kitchens.'
})
const showCreateCell = computed(
  () =>
    workspace.targets.outcome.value !== 'pending' &&
    workspace.targets.outcome.value !== 'error' &&
    canCreateMultiple.value
)
const showUpgradeCell = computed(
  () => otherKitchenCells.value.length > 0 && !canCreateMultiple.value
)
const showCollectionControls = computed(
  () =>
    mounted.value &&
    (workspace.targets.pending.value ||
      workspace.targets.outcome.value === 'error' ||
      otherKitchenCells.value.length > 0 ||
      canCreateMultiple.value)
)
const createDescription = computed(() =>
  kitchenCells.value.length
    ? 'Business supports multiple Kitchens.'
    : 'Search Misebox and Google, or continue with a name.'
)
const debugObjects = computed(() => ({
  activeKitchen: workspace.selection.kitchen.value,
  kitchens: workspace.targets.kitchens.value,
}))
const debugState = computed(() => ({
  subscription: subscription.value,
  subscriptionOutcome: appAccessOutcome.value,
  targetOutcome: workspace.targets.outcome.value,
  activeKitchenId: workspace.selection.kitchenId.value,
  canCreateMultiple: canCreateMultiple.value,
  canCreate: showCreateCell.value,
  changeRequest: {
    open: changeRequestOpen.value,
    requestedKitchenId: requestedKitchenId.value,
    appliesImmediately: true,
  },
  kitchens: kitchenCells.value.map(
    (item: { card: { id: string; name: string }; complete: boolean }) => ({
      id: item.card.id,
      name: item.card.name,
      complete: item.complete,
      active: item.card.id === workspace.selection.kitchenId.value,
      requiresChangeRequest: requiresChangeRequest(item.card.id),
    })
  ),
}))

function requiresChangeRequest(id: string) {
  return !canCreateMultiple.value && id !== workspace.selection.kitchenId.value
}

function kitchenBadges(item: (typeof kitchenCells.value)[number]) {
  const badges: string[] = []
  if (requiresChangeRequest(item.card.id)) badges.push('Request change')
  if (!item.complete) badges.push('Setup incomplete')
  return badges
}

async function createdKitchen(id: string) {
  workspace.actions.selectKitchen(id)
  await workspace.targets.refresh()
}

async function openKitchen(item: (typeof kitchenCells.value)[number]) {
  if (requiresChangeRequest(item.card.id)) {
    requestedKitchenId.value = item.card.id
    changeRequestOpen.value = true
    return
  }
  workspace.actions.selectKitchen(
    item.card.id,
    item.card.name,
    item.card.prop || 'My Kitchen',
    item.card.imageUrl
  )
  await navigateTo(
    item.complete
      ? '/workspace/kitchen/overview'
      : '/workspace/kitchen/identity'
  )
}

const changeRequestOpen = ref(false)
const requestedKitchenId = ref('')
const requestedKitchen = computed(() =>
  kitchenCells.value.find(
    (item: { card: { id: string } }) =>
      item.card.id === requestedKitchenId.value
  )
)
const changeRequestDescription = computed(() => {
  const name = requestedKitchen.value?.card.name || 'this Kitchen'
  return `Make ${name} the active Kitchen. Requests apply immediately for now.`
})

function confirmKitchenChange() {
  const item = requestedKitchen.value
  if (!item) return
  workspace.actions.selectKitchen(
    item.card.id,
    item.card.name,
    item.card.prop || 'My Kitchen',
    item.card.imageUrl
  )
  changeRequestOpen.value = false
  requestedKitchenId.value = ''
}

</script>
