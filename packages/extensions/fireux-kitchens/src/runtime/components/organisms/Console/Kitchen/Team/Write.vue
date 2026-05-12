<template>
  <div class="space-y-6">
    <UCard>
      <template #header>
        <div class="console-card-header">
          <div class="console-card-header__title">Add team member</div>
          <p class="console-card-header__description">
            Add a fake operational team member to this test kitchen. This does not use real users or grant console access.
          </p>
        </div>
      </template>

      <form class="space-y-4" @submit.prevent="addTeamMember">
        <div class="grid gap-4 sm:grid-cols-2">
          <UFormField label="Display name">
            <UInput
              v-model="name"
              placeholder="Prep Cook"
              :disabled="saving || !canCreateTeamMember"
            />
          </UFormField>

          <UFormField label="Role">
            <UInput
              v-model="role"
              placeholder="Prep"
              :disabled="saving || !canCreateTeamMember"
            />
          </UFormField>
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <UFormField label="Station ids">
            <UInput
              v-model="stationIdsText"
              placeholder="grill, pass"
              :disabled="saving || !canCreateTeamMember"
            />
          </UFormField>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <UButton
            type="submit"
            :loading="saving"
            :disabled="!canCreateTeamMember || !name.trim()"
          >
            Add team member
          </UButton>

          <p v-if="message" class="text-xs text-dimmed">
            {{ message }}
          </p>
        </div>
      </form>
    </UCard>

    <UCard>
      <template #header>
        <div class="console-card-header">
          <div class="console-card-header__title">Join requests</div>
          <p class="console-card-header__description">
            Pending requests from people asking to join this kitchen team.
          </p>
        </div>
      </template>

      <div v-if="pendingJoinRequests.length" class="space-y-2">
        <div
          v-for="request in pendingJoinRequests"
          :key="request.id"
          class="rounded-lg border border-default px-3 py-2"
        >
          <p class="text-sm font-medium text-highlighted">
            {{ requestName(request) }}
          </p>
          <p v-if="request.message" class="text-xs text-dimmed">
            {{ request.message }}
          </p>
          <p class="mt-1 text-xs text-dimmed">
            Approval and rejection controls will live here.
          </p>
        </div>
      </div>

      <p v-else class="text-sm text-dimmed">
        No pending join requests.
      </p>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useKitchenConsoleTeam } from '../../../../../composables/fireux/app/kitchen-console/useKitchenConsoleTeam'
import { useKitchenTeamMemberCreate } from '../../../../../composables/fireux/console/kitchen/team/mutations/useKitchenTeamMemberCreate'
import type { KitchenTeamJoinRequest } from '../../../../../models/kitchen-team.model'

const {
  selectedMode,
  kitchenId,
  rootCollection,
  canWrite,
  teamMembers,
  pendingJoinRequests,
} = useKitchenConsoleTeam()
const { createKitchenTeamMember } = useKitchenTeamMemberCreate()

const name = ref('')
const role = ref('')
const stationIdsText = ref('')
const saving = ref(false)
const message = ref('')
const canCreateTeamMember = computed(
  () =>
    canWrite.value &&
    selectedMode.value === 'test' &&
    rootCollection.value === 'kitchens'
)
const normalizeString = (value: unknown) => String(value ?? '').trim()
const stationIds = computed(() =>
  Array.from(
    new Set(
      stationIdsText.value
        .split(',')
        .map((value) => normalizeString(value))
        .filter(Boolean)
    )
  )
)
const nextSortOrder = computed(() => {
  const orders = teamMembers.value
    .map((member) => Number(member.sort_order))
    .filter((value) => Number.isFinite(value))
  return orders.length ? Math.max(...orders) + 1 : 1
})
const requestName = (request: KitchenTeamJoinRequest) =>
  normalizeString(request.name) || 'Missing team member name'

const addTeamMember = async () => {
  if (!canCreateTeamMember.value || saving.value) return

  saving.value = true
  message.value = ''

  try {
    const memberId = await createKitchenTeamMember({
      kitchenId: kitchenId.value,
      kitchenCollectionPath: rootCollection.value,
      name: name.value,
      role: role.value,
      stationIds: stationIds.value,
      sortOrder: nextSortOrder.value,
    })
    name.value = ''
    role.value = ''
    stationIdsText.value = ''
    message.value = `Added ${memberId}.`
  } catch (error) {
    message.value = String((error as any)?.message || error || 'Add team member failed.')
  } finally {
    saving.value = false
  }
}
</script>
