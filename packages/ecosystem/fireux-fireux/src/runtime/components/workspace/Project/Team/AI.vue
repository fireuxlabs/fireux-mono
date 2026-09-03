<template>
  <WorkspaceAI aria-label="Project Team AI" compact>
    <UCard v-if="result" aria-live="polite">
      <div class="space-y-4">
        <div class="flex items-start gap-3">
          <UIcon
            :name="
              pendingName ? 'i-lucide-wand-sparkles' : 'i-lucide-circle-check'
            "
            class="mt-0.5 size-5 shrink-0 text-primary"
          />
          <div class="min-w-0 flex-1">
            <p
              class="text-xs font-semibold uppercase tracking-wide text-dimmed"
            >
              {{ pendingName ? 'Ready for approval' : 'Result' }}
            </p>
            <p class="mt-1 text-sm text-toned">{{ result }}</p>
          </div>
        </div>

        <div v-if="pendingName" class="flex justify-end gap-2">
          <UButton
            label="Cancel"
            color="neutral"
            variant="ghost"
            @click="reset"
          />
          <UButton
            label="Confirm action"
            icon="i-lucide-play"
            :loading="submitting"
            @click="confirmCreate"
          />
        </div>
        <div v-else class="flex justify-end gap-2">
          <UButton
            v-if="resultMemberId"
            :to="`/workspace/project/team/${encodeURIComponent(resultMemberId)}`"
            :label="`View ${resultMemberName}`"
            color="primary"
            variant="soft"
          />
          <UButton
            label="New request"
            color="neutral"
            variant="ghost"
            icon="i-lucide-rotate-ccw"
            @click="reset"
          />
        </div>
      </div>
    </UCard>

    <WorkspaceAIComposer
      v-else
      v-model="prompt"
      placeholder="Ask Project Team AI…"
      :suggestions="suggestions"
      :can-submit="Boolean(prompt.trim())"
      :submitting="submitting"
      suggestions-aria-label="Suggested Project actions"
      aria-label="Ask Project Team AI"
      @submit="submit"
      @select-suggestion="prompt = $event.label"
    />
  </WorkspaceAI>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { useProjectWorkspaceTeam } from 'fireux-core/runtime/project/composables/workspace/team/useProjectWorkspaceTeam'

type Workspace = ReturnType<typeof useProjectWorkspaceTeam>

const props = defineProps<{
  state: Workspace['state']['value']
  derived: Workspace['derived']['value']
  primitives: Workspace['primitives']
}>()

const prompt = ref('')
const result = ref('')
const pendingName = ref('')
const resultMemberId = ref('')
const resultMemberName = ref('')
const submitting = ref(false)

const suggestions = computed(() => [
  ...(props.derived.capability.primitives.create.available
    ? [
        { label: 'Create a Team member' },
        { label: 'Find and link an existing User' },
        { label: 'Add an unlinked named person' },
      ]
    : []),
  ...(props.derived.capability.primitives.read.available
    ? [{ label: 'Read the Project Team' }]
    : []),
])

function teamSummary() {
  const members = props.state.team.members
  if (!members.length) return 'This Project Team has no active members.'
  return `${props.state.project.name || 'This Project'} has ${members.length} active Team ${members.length === 1 ? 'member' : 'members'}: ${members.map((member) => `${member.name} (${member.role})`).join(', ')}.`
}

function submit() {
  const request = prompt.value.trim()
  if (!request || submitting.value) return
  const create = request.match(
    /\b(?:add|create)\s+(?:a\s+)?(?:(?:new\s+)?(?:team\s+)?member\s+)?(?:named\s+|called\s+)?([\p{L}][\p{L}'’-]*(?:\s+[\p{L}][\p{L}'’-]*)?)(?:\s+to\s+(?:the\s+)?team)?[.!?]*$/iu
  )
  if (create && props.derived.capability.primitives.create.available) {
    pendingName.value = create[1].trim()
    result.value = `Add ${pendingName.value} to ${props.state.project.name || 'this Project'} as a Team member?`
  } else if (
    /\b(?:who|list|show|read)\b.*\b(?:team|members?|people)\b/iu.test(request)
  ) {
    result.value = teamSummary()
  } else {
    result.value =
      'Project Team AI can currently read the Team or prepare a named Team member for confirmation.'
  }
  prompt.value = ''
}

async function confirmCreate() {
  const name = pendingName.value
  if (!name || submitting.value) return
  submitting.value = true
  try {
    const created = await props.primitives.create({ name })
    pendingName.value = ''
    resultMemberId.value = created.memberId
    resultMemberName.value = created.name
    result.value = `${created.name} has been added to this Project Team.`
  } catch (cause) {
    pendingName.value = ''
    result.value =
      cause instanceof Error
        ? cause.message
        : 'The Team member could not be added.'
  } finally {
    submitting.value = false
  }
}

function reset() {
  prompt.value = ''
  result.value = ''
  pendingName.value = ''
  resultMemberId.value = ''
  resultMemberName.value = ''
}
</script>
