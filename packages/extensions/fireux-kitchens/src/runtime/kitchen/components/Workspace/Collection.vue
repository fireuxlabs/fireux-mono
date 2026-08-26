<template>
  <section class="grid gap-4" aria-labelledby="my-kitchens-title">
    <USkeleton
      v-if="workspace.targets.pending.value"
      class="h-28 rounded-xl"
      aria-label="Loading active Kitchen"
    />
    <WorkspaceKitchenIndexActive
      v-else-if="workspace.selection.kitchen.value"
      :kitchen="workspace.selection.kitchen.value"
    />
    <WorkspaceActiveEntity
      v-else
      label="Kitchen"
      :changeable="false"
      empty-title="No Kitchen yet"
      empty-description="Start a Kitchen below to open its Workspace."
    />

    <div class="flex flex-wrap items-end justify-between gap-3">
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
      <UBadge color="neutral" variant="soft">
        {{ subscriptionLabel }}
      </UBadge>
    </div>

    <div class="grid gap-3 md:grid-cols-2">
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
        v-for="item in kitchenCells"
        v-else
        :key="item.card.id"
        v-bind="item.card"
        :badges="kitchenBadges(item)"
        action
        :selected="
          !requiresChangeRequest(item.card.id) &&
          item.card.id === workspace.selection.kitchenId.value
        "
        @action="openKitchen(item)"
      />

      <Create
        v-if="showCreateCell"
        launcher="cell"
        :label="kitchenCells.length ? 'Add another Kitchen' : 'Start a Kitchen'"
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
            <div class="card__title">Add another Kitchen</div>
            <div class="card__subtitle">
              Upgrade to Business to create more Kitchens.
            </div>
          </div>
        </div>
      </NuxtLink>
    </div>

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

    <DevDebugPanel
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
import { computed, navigateTo, ref, watchEffect } from '#imports'
import { useUser } from 'fireux-core/runtime/user/composables/useUser'
import { useKitchenWorkspace } from '../../composables/workspace/core/useKitchenWorkspace'
import { useKitchenInterface } from '../../composables/firestore/utils/view/useKitchenInterface'
import Create from './Create.vue'

const { appAccess, appAccessOutcome } = useUser()
const workspace = useKitchenWorkspace()
const { workspaceTarget } = useKitchenInterface()

const subscription = computed(() =>
  appAccessOutcome.value === 'ready' ? appAccess.value.subscription : 'free'
)
const subscriptionLabel = computed(
  () => subscription.value.charAt(0).toUpperCase() + subscription.value.slice(1)
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
const title = computed(() =>
  kitchenCells.value.length > 1 ? 'My Kitchens' : 'My Kitchen'
)
const description = computed(() => {
  if (kitchenCells.value.length <= 1) {
    return 'Open your Kitchen or finish setting it up.'
  }
  return canCreateMultiple.value
    ? 'Choose a Kitchen or add another.'
    : 'One Kitchen can be active. Request a change to open another.'
})
const showCreateCell = computed(
  () =>
    workspace.targets.outcome.value !== 'pending' &&
    workspace.targets.outcome.value !== 'error' &&
    (!kitchenCells.value.length || canCreateMultiple.value)
)
const showUpgradeCell = computed(
  () => kitchenCells.value.length > 0 && !canCreateMultiple.value
)
const createDescription = computed(() =>
  kitchenCells.value.length
    ? 'Business supports multiple Kitchens.'
    : 'Create the Kitchen, then add its identity and Menu.'
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

watchEffect(() => {
  if (
    appAccessOutcome.value !== 'ready' ||
    workspace.targets.outcome.value !== 'ready' ||
    (workspace.selection.kitchenId.value &&
      !requiresChangeRequest(workspace.selection.kitchenId.value))
  ) {
    return
  }
  const first = kitchenCells.value[0]?.card
  if (!first?.id) return
  workspace.actions.selectKitchen(
    first.id,
    first.name,
    first.prop || 'My Kitchen',
    first.imageUrl
  )
})

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
