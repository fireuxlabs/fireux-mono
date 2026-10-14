<template>
  <div class="mx-auto grid w-full min-w-0 max-w-6xl gap-6">
    <UBreadcrumb
      :ui="{ list: 'flex-wrap' }"
      :items="[
        {
          label: identity.selectedKitchen.value?.name || 'Kitchen',
          to: workspaceEntryPath,
        },
        { label: 'Identity' },
      ]"
    />
    <p class="text-sm text-muted">
      Manage your Kitchen listing, venue profile, hours and appearance.
    </p>
    <WorkspaceKitchenIdentityListing :identity="identity" />
    <USkeleton
      v-if="
        identity.outcome.value === 'pending' ||
        identity.outcome.value === 'idle'
      "
      class="h-16 rounded-xl"
    />
    <UAlert
      v-else-if="identity.outcome.value === 'empty'"
      title="No Kitchen selected"
      description="Choose a Kitchen to continue."
      icon="i-lucide-utensils"
    />
    <MoleculesStateCard
      v-else-if="
        identity.outcome.value === 'error' ||
        identity.outcome.value === 'missing'
      "
      entity="Kitchen"
      kind="document"
      :state="identity.outcome.value"
      surface="bare"
    />
    <section
      aria-label="Identity pages"
      class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      <NuxtLink
        v-for="item in children"
        :key="item.key"
        :to="item.to"
        :aria-label="item.label"
        class="group block min-w-0 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <UCard class="h-full transition-colors group-hover:ring-primary/50">
          <div class="flex items-start gap-3">
            <UIcon
              :name="item.icon || 'i-lucide-id-card'"
              class="mt-0.5 size-5 shrink-0 text-primary"
            />
            <div class="min-w-0 flex-1">
              <h2 class="font-semibold text-highlighted">{{ item.label }}</h2>
              <p class="mt-2 text-sm text-muted">{{ item.description }}</p>
            </div>
            <UIcon
              name="i-lucide-arrow-right"
              class="mt-0.5 size-4 shrink-0 text-muted"
            />
          </div>
        </UCard>
      </NuxtLink>
    </section>
    <ClientOnly
      ><DiagnosticsDebugPanel v-bind="debug" title="Identity overview debug"
    /></ClientOnly>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import WorkspaceKitchenIdentityListing from './Listing.vue'
import { useNav } from 'fireux-core/runtime/composables/navigation/useNav'
import { useWorkspaceEntryCta } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceEntryCta'
import { defineDevDebugPayload } from 'fireux-core/runtime/types/dev-debug'
import {
  identityKitchenDebug,
  identityPlaceDebug,
} from '../../../utils/identity-debug'
import type { useKitchenIdentity } from '../../../composables/workspace/identity/useKitchenIdentity'
const props = defineProps<{ identity: ReturnType<typeof useKitchenIdentity> }>()
const { workspaceEntryPath } = useWorkspaceEntryCta('kitchen')
const navigation = useNav(['workspace'])
const children = computed(() =>
  navigation.items.value
    .filter(
      (item) =>
        item.group === 'Identity' &&
        item.to.startsWith('/workspace/kitchen/identity/')
    )
    .sort((a, b) => a.order - b.order)
)
const debug = computed(() =>
  defineDevDebugPayload({
    objectOrigin: 'passed',
    objects: {
      kitchen: identityKitchenDebug(props.identity.selectedKitchen.value),
      place: identityPlaceDebug(props.identity.place.value),
    },
    derived: {
      kitchenId: props.identity.kitchenId.value,
      status: props.identity.status.value,
      children: children.value.map((item) => ({
        label: item.label,
        to: item.to,
      })),
    },
  })
)
</script>
