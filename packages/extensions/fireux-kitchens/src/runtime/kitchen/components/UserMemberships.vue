<template>
  <section
    v-if="response"
    class="space-y-6"
    aria-labelledby="user-kitchens-title"
  >
    <UPageHeader
      id="user-kitchens-title"
      headline="Misebox business"
      title="Kitchens"
      :description="summary"
    >
      <template #links>
        <div class="flex flex-wrap items-center gap-2">
          <UBadge color="primary" variant="soft">
            {{ subscriptionLabel }}
          </UBadge>
          <UButton
            v-if="isOwnProfile"
            to="/workspace/kitchen"
            label="Open Kitchen Workspace"
            icon="i-lucide-chef-hat"
            color="neutral"
            variant="outline"
          />
        </div>
      </template>
    </UPageHeader>

    <UAlert
      v-if="teamIssues.length"
      color="warning"
      variant="subtle"
      icon="i-lucide-triangle-alert"
      title="Kitchen access needs attention"
      :description="teamIssueDescription"
    />

    <UPageGrid v-if="cells.length" as="ul" class="list-none">
      <li v-for="cell in cells" :key="cell.to">
        <CollectionCell :cell="cell" />
      </li>
    </UPageGrid>
  </section>

  <DevDebugPanel
    v-if="canInspect"
    title="User Kitchen memberships"
    context="Kitchen access, resolved Kitchens and Places, matching Team profiles, and the final profile cells."
    object-origin="fetched"
    :objects="debugObjects"
    :derived="debugDerived"
    launcher
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import CollectionCell from 'fireux-core/runtime/components/Collection/Cell.vue'
import type { CollectionCellData } from 'fireux-core/runtime/models/utils/collection-cell'
import type { User } from 'fireux-core/runtime/user/models/user.model'
import { useKitchenUserMemberships } from '../composables/useKitchenUserMemberships'
import type { KitchenUserMembershipItem } from '../models/user-memberships.model.ts'

const props = defineProps<{
  user: Pick<User, 'id' | 'display_name'>
}>()

const subjectUserId = computed(() => props.user.id)
const { response, pending, error, canInspect, isOwnProfile } =
  useKitchenUserMemberships(subjectUserId)

const titleCase = (value: string) =>
  value ? `${value.charAt(0).toUpperCase()}${value.slice(1)}` : ''
const subscriptionLabel = computed(() =>
  titleCase(response.value?.app_user.subscription || '')
)
const summary = computed(() => {
  const count = response.value?.items.length || 0
  return `${props.user.display_name} is connected to ${count} ${count === 1 ? 'Kitchen' : 'Kitchens'} in this App.`
})
const teamIssues = computed(() =>
  (response.value?.items || []).filter(
    (item: KitchenUserMembershipItem) => item.team_state !== 'linked'
  )
)
const teamIssueDescription = computed(() =>
  teamIssues.value
    .map((item: KitchenUserMembershipItem) => {
      const name = item.place?.name || item.kitchen_id
      if (item.team_state === 'invalid')
        return `${name}: Team access does not match this User.`
      return `${name}: no matching Kitchen Team record.`
    })
    .join(' ')
)
const cells = computed<CollectionCellData[]>(() =>
  (response.value?.items || []).flatMap((item: KitchenUserMembershipItem) => {
    if (!item.kitchen || !item.place) return []
    const teamBadge = item.team ? 'Team member' : 'Team access missing'
    return [
      {
        title: item.place.name,
        description:
          item.place.tagline ||
          item.place.about ||
          `${props.user.display_name}'s Kitchen`,
        image: item.place.cover_image || item.place.image_url,
        imageStyle: 'cover' as const,
        fallbackIcon: 'i-lucide-utensils',
        meta: item.place.short_address || item.place.formatted_address,
        badges: [titleCase(item.kitchen.status), teamBadge],
        actionLabel: 'View Kitchen',
        to: `/kitchens/${encodeURIComponent(item.kitchen.slug)}`,
      },
    ]
  })
)
const debugObjects = computed(() => ({
  appUser: response.value?.app_user || null,
  kitchens: (response.value?.items || []).map(
    (item: KitchenUserMembershipItem) => item.kitchen
  ),
  places: (response.value?.items || []).map(
    (item: KitchenUserMembershipItem) => item.place
  ),
  teams: (response.value?.items || []).map(
    (item: KitchenUserMembershipItem) => item.team
  ),
}))
const debugDerived = computed(() => ({
  canInspect: canInspect.value,
  isOwnProfile: isOwnProfile.value,
  pending: pending.value,
  error:
    error.value instanceof Error ? error.value.message : error.value || null,
  cells: cells.value,
  teamIssues: teamIssues.value.map((item: KitchenUserMembershipItem) => ({
    kitchenId: item.kitchen_id,
    state: item.team_state,
  })),
}))
</script>
