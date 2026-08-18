<template>
  <div
    v-if="pending || sortedMembers.length"
    ref="peopleCollection"
    tabindex="-1"
    class="outline-none"
  >
    <UCard :ui="{ body: 'p-0 sm:p-0' }">
      <template #header>
        <div class="flex items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <h2 class="text-base font-semibold text-highlighted">People</h2>
            <span class="text-sm tabular-nums text-dimmed">
              {{ sortedMembers.length }}
            </span>
          </div>
          <div role="toolbar" aria-label="People tools">
            <UNavigationMenu
              :items="readTools"
              orientation="horizontal"
              content-orientation="vertical"
              aria-label="People read tools"
            />
          </div>
        </div>
      </template>

      <div v-if="pending" class="divide-y divide-default px-4 sm:px-6">
        <div
          v-for="index in 3"
          :key="index"
          class="flex items-center gap-3 py-4"
        >
          <USkeleton class="size-10 shrink-0 rounded-full" />
          <USkeleton class="h-4 w-32" />
        </div>
      </div>

      <ul v-else-if="sortedMembers.length" class="divide-y divide-default">
        <li
          v-for="member in sortedMembers"
          :id="memberAnchor(member)"
          :key="member.id"
          class="flex scroll-mt-6 items-center gap-3 px-4 py-3 transition-colors target:bg-primary/5 sm:px-6"
        >
          <UAvatar
            :alt="memberDisplayName(member)"
            :text="memberInitials(member)"
            size="md"
            class="shrink-0"
          />

          <div class="min-w-0 flex-1">
            <h3 class="truncate text-sm font-medium text-highlighted">
              {{ memberDisplayName(member) }}
            </h3>
            <p
              v-if="member.user_id"
              class="mt-0.5 flex items-center gap-1 text-xs text-success"
            >
              <UIcon name="i-lucide-circle-check" class="size-3.5" />
              Account linked
            </p>
          </div>

          <div class="flex shrink-0 items-center gap-1">
            <UButton
              label="Edit"
              icon="i-lucide-pencil"
              color="neutral"
              variant="ghost"
              size="sm"
              @click="emit('edit', member)"
            />
            <UButton
              v-if="!member.user_id"
              label="Invite"
              icon="i-lucide-link"
              color="neutral"
              variant="ghost"
              size="sm"
              :loading="invitingMemberId === member.id"
              :disabled="Boolean(invitingMemberId)"
              @click="emit('invite', member)"
            />
            <UButton
              v-if="!member.user_id"
              label="Delete"
              icon="i-lucide-trash-2"
              color="error"
              variant="ghost"
              size="sm"
              :loading="deletingMemberId === member.id"
              :disabled="Boolean(deletingMemberId)"
              @click="emit('delete', member)"
            />
          </div>
        </li>
      </ul>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'
import { computed, ref } from 'vue'
import type { KitchenTeamMember } from '../../../models/team.model.ts'
import { resolveKitchenTeamMemberAnchor } from '../../../utils/team-member-anchor'

const props = withDefaults(
  defineProps<{
    members?: KitchenTeamMember[]
    pending?: boolean
    invitingMemberId?: string
    deletingMemberId?: string
  }>(),
  {
    members: () => [],
    pending: false,
    invitingMemberId: '',
    deletingMemberId: '',
  }
)

const emit = defineEmits<{
  edit: [member: KitchenTeamMember]
  invite: [member: KitchenTeamMember]
  delete: [member: KitchenTeamMember]
}>()

const peopleCollection = ref<HTMLElement | null>(null)
const readTools: NavigationMenuItem[] = [
  {
    label: 'Read',
    icon: 'i-lucide-eye',
    children: [
      {
        label: 'View people',
        description: 'View the current Kitchen Team collection.',
        icon: 'i-lucide-users',
        onSelect: () => {
          peopleCollection.value?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          })
          peopleCollection.value?.focus({ preventScroll: true })
        },
      },
    ],
  },
]

const normalizeString = (value: unknown) => String(value ?? '').trim()
const memberName = (member: KitchenTeamMember) => normalizeString(member.name)
const memberDisplayName = (member: KitchenTeamMember) =>
  normalizeString(member.display_name) || memberName(member) || 'Team member'
const memberInitials = (member: KitchenTeamMember) =>
  memberDisplayName(member)
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')
const memberAnchor = (member: KitchenTeamMember) =>
  resolveKitchenTeamMemberAnchor(member)
const sortOrder = (member: KitchenTeamMember) => {
  const value = Number(member.sort_order)
  return Number.isFinite(value) ? value : Number.MAX_SAFE_INTEGER
}
const sortedMembers = computed(() =>
  props.members
    .filter((member) => member.active !== false && member.status !== 'inactive')
    .sort((left, right) => {
      const byOrder = sortOrder(left) - sortOrder(right)
      if (byOrder) return byOrder

      return memberDisplayName(left).localeCompare(memberDisplayName(right))
    })
)
</script>
