<template>
  <UModal
    v-model:open="open"
    title="Onboard a teammate"
    description="Choose a person, review their responsibility, then confirm."
    :dismissible="!progress.busy"
    :close="!progress.busy"
  >
    <template #body>
      <div class="space-y-5">
        <WorkspaceTeamCrudCreatePerson
          v-if="stage === 'person'"
          prepare-only
          :initial-name="initialName"
          :create="choosePerson"
          @created="stage = 'review'"
          @cancel="open = false"
        />
        <template v-else>
          <div>
            <h3 class="font-semibold">{{ person.name }}</h3>
            <p class="text-sm text-muted">
              {{
                person.userId
                  ? 'Existing User · account will be linked'
                  : 'New unlinked person'
              }}
            </p>
          </div>
          <template v-if="stage === 'review'">
            <UFormField label="Responsibility">
              <USelect v-model="role" :items="roles" class="w-full" />
            </UFormField>
            <p class="text-sm text-muted">
              Members participate in the Team. Operators can manage the Kitchen;
              only its owner can grant operator access.
            </p>
            <UCheckbox
              v-if="!person.userId"
              v-model="invite"
              label="Prepare an invitation link"
            />
            <p class="text-sm text-muted">
              {{
                person.userId
                  ? 'This person already has an account, so no claim invitation is needed.'
                  : invite
                    ? 'The one-use link expires after seven days. You choose how to share it; no message is sent.'
                    : 'You can create an invitation from People later.'
              }}
            </p>
            <UAlert
              color="neutral"
              variant="subtle"
              title="Review before adding"
              :description="`Add ${person.name} as ${role === 'operator' ? 'an operator' : 'a member'}${invite && !person.userId ? ' and prepare an invitation link' : ''}. This uses one Team member place.`"
            />
            <div class="flex justify-between gap-2">
              <UButton
                label="Back"
                color="neutral"
                variant="ghost"
                @click="back"
              />
              <UButton
                label="Confirm onboarding"
                :disabled="!canStart"
                @click="confirm"
              />
            </div>
          </template>
          <template v-else>
            <ul class="space-y-2 text-sm" aria-label="Onboarding progress">
              <li>
                {{
                  progress.memberId
                    ? '✓ Member added'
                    : 'Member creation not confirmed'
                }}
              </li>
              <li>
                {{
                  progress.responsibilitySaved
                    ? `✓ Responsibility: ${role}`
                    : 'Responsibility still to be saved'
                }}
              </li>
              <li v-if="invite && !person.userId">
                {{
                  progress.invitationLink
                    ? '✓ Invitation link ready'
                    : 'Invitation link still to be prepared'
                }}
              </li>
            </ul>
            <UAlert
              v-if="progress.error"
              color="warning"
              title="Onboarding needs attention"
              :description="progress.error"
            />
            <UAlert
              v-if="progress.complete"
              color="success"
              title="Teammate added"
              description="The completed steps are saved. No invitation message has been sent."
            />
            <UButton
              v-if="progress.invitationLink"
              label="Copy invitation link"
              icon="i-lucide-copy"
              @click="copyLink"
            />
            <div class="flex justify-end gap-2">
              <UButton
                label="Close"
                color="neutral"
                variant="ghost"
                :disabled="progress.busy"
                @click="open = false"
              />
              <UButton
                v-if="!progress.complete && progress.memberId"
                label="Retry remaining steps"
                :loading="progress.busy"
                :disabled="!sameKitchen"
                @click="run"
              />
              <span
                v-if="progress.busy"
                role="status"
                class="text-sm text-muted"
                >Saving onboarding…</span
              >
            </div>
          </template>
        </template>
      </div>
    </template>
  </UModal>
</template>
<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import type { useKitchenWorkspaceTeam } from '../../../composables/workspace/team/useKitchenWorkspaceTeam'
import { useKitchenTeamMemberCreate } from '../../../composables/workspace/team/mutations/useKitchenTeamMemberCreate'
import { useKitchenTeamMemberUpdate } from '../../../composables/workspace/team/mutations/useKitchenTeamMemberUpdate'
import { useKitchenMemberInvitationCreate } from '../../../composables/workspace/team/mutations/useKitchenMemberInvitationCreate'
import {
  createTeamOnboardingProgress,
  runTeamOnboarding,
  type TeamOnboardingDraft,
} from '../../../utils/team-onboarding'
const props = defineProps<{
  team: ReturnType<typeof useKitchenWorkspaceTeam>
}>()
const open = ref(false)
const initialName = ref('')
const stage = ref<'person' | 'review' | 'result'>('person')
const person = ref<{ name: string; userId?: string }>({ name: '' })
const role = ref<'member' | 'operator'>('member')
const invite = ref(true)
const kitchenId = ref('')
const progress = reactive(createTeamOnboardingProgress())
const roles = [
  { label: 'Member', value: 'member' },
  { label: 'Operator', value: 'operator' },
]
const sameKitchen = computed(
  () => kitchenId.value === props.team.state.value.kitchen.id
)
const canStart = computed(
  () =>
    sameKitchen.value &&
    props.team.derived.value.capability.primitives.create.available
)
const { createKitchenTeamMember } = useKitchenTeamMemberCreate()
const { updateKitchenTeamMember } = useKitchenTeamMemberUpdate()
const { createKitchenMemberInvitation } = useKitchenMemberInvitationCreate()
const toast = useToast()
let draft: TeamOnboardingDraft | null = null
function show(name = '') {
  if (
    progress.busy ||
    !props.team.derived.value.capability.primitives.create.available
  )
    return
  initialName.value = name
  person.value = { name: '' }
  role.value = 'member'
  invite.value = true
  stage.value = 'person'
  kitchenId.value = props.team.state.value.kitchen.id
  Object.assign(progress, createTeamOnboardingProgress())
  draft = null
  open.value = true
}
async function choosePerson(input: { name: string; userId?: string }) {
  if (
    input.userId &&
    props.team.state.value.team.members.some(
      (member) => member.userId === input.userId
    )
  )
    throw new Error(
      'This person is already on the Team. Choose their record in People.'
    )
  person.value = input
  return input
}
function back() {
  initialName.value = person.value.name
  stage.value = 'person'
}
async function confirm() {
  if (!canStart.value) return
  draft = {
    kitchenId: kitchenId.value,
    ...person.value,
    role: role.value,
    invite: invite.value,
  }
  stage.value = 'result'
  await run()
}
async function run() {
  if (!draft) return
  await runTeamOnboarding(draft, progress, {
    currentKitchenId: () => props.team.state.value.kitchen.id,
    create: createKitchenTeamMember,
    update: updateKitchenTeamMember,
    invite: createKitchenMemberInvitation,
  })
  if (progress.memberId && sameKitchen.value)
    props.team.natives.selectCreated(progress.memberId)
}
async function copyLink() {
  try {
    await navigator.clipboard.writeText(progress.invitationLink)
    toast.add({ title: 'Invitation link copied', color: 'success' })
  } catch {
    toast.add({ title: 'Could not copy invitation link', color: 'error' })
  }
}
defineExpose({ show })
</script>
