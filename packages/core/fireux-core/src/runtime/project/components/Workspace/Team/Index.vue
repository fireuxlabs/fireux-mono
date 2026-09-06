<template>
  <section
    id="project-team-members"
    class="workspace-surface workspace-surface--compact"
    aria-label="Project Team"
  >
    <UCard>
      <template #header
        ><WorkspaceProjectTeamCrud ref="crud" :team="team"
      /></template>
      <div v-if="selected" class="flex items-center gap-3">
        <UAvatar
          :src="selected.avatar || undefined"
          :alt="selected.name"
          size="lg"
        />
        <div>
          <p class="text-xs text-muted">Selected member</p>
          <h2 class="text-xl font-semibold">{{ selected.name }}</h2>
          <p v-if="selected.jobTitle" class="text-sm text-muted">
            {{ selected.jobTitle }}
          </p>
          <p class="text-sm text-muted">
            {{ selected.role }} ·
            {{ selected.userId ? 'Account linked' : 'Unlinked person' }}
          </p>
        </div>
        <UButton
          :to="`/workspace/project/team/${encodeURIComponent(selected.id)}`"
          label="Details"
          color="neutral"
          variant="ghost"
          class="ml-auto"
        />
      </div>
      <p v-else class="text-sm text-muted">
        {{ pending ? 'Loading Team…' : 'Choose a member or create one.' }}
      </p>
    </UCard>
    <UCard
      v-if="pending || state.team.members.length"
      :ui="{ body: 'p-0 sm:p-0' }"
    >
      <template #header>
        <div class="flex items-center gap-3">
          <h2 class="text-base font-semibold text-highlighted">People</h2>
          <span class="text-sm tabular-nums text-dimmed">
            {{ state.team.members.length }}
          </span>
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

      <ul v-else class="divide-y divide-default">
        <li v-for="member in state.team.members" :key="member.id">
          <button
            type="button"
            class="flex w-full items-center gap-3 px-4 py-3 text-left sm:px-6"
            :class="{
              'bg-elevated': member.id === state.team.selectedTeamMemberId,
            }"
            :aria-pressed="member.id === state.team.selectedTeamMemberId"
            :aria-label="`Select ${member.name}`"
            @click="natives.select(member.id)"
          >
            <UAvatar
              :src="member.avatar || undefined"
              :alt="member.name"
              size="md"
              class="shrink-0"
            />
            <div class="min-w-0 flex-1">
              <h3 class="truncate text-sm font-medium text-highlighted">
                {{ member.name }}
              </h3>
              <p v-if="member.jobTitle" class="text-sm text-muted">
                {{ member.jobTitle }}
              </p>
            </div>
            <UBadge color="neutral" variant="subtle">
              {{ member.role }}
            </UBadge>
          </button>
        </li>
      </ul>
    </UCard>

    <UAlert
      v-if="!pending && derived.status === 'error'"
      color="error"
      variant="soft"
      icon="i-lucide-circle-alert"
      title="Project Team could not be loaded"
      description="Please try again."
    />

    <UAlert
      v-else-if="!pending && !state.team.members.length"
      color="neutral"
      variant="subtle"
      icon="i-lucide-users"
      title="No team members yet"
      description="Add the first person to begin this Project Team."
    />
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import WorkspaceProjectTeamCrud from './Crud.vue'
import type { ProjectTeamIntent } from '../../../models/team-intent'
import type { useProjectWorkspaceTeam } from '../../../composables/workspace/team/useProjectWorkspaceTeam'

type Workspace = ReturnType<typeof useProjectWorkspaceTeam>

const props = defineProps<{ team: Workspace }>()
const { state, derived, natives } = props.team

const crud = ref<InstanceType<typeof WorkspaceProjectTeamCrud>>()
const selected = computed(() =>
  state.value.team.members.find(
    (member) => member.id === state.value.team.selectedTeamMemberId
  )
)
defineExpose({
  openAction: (intent: ProjectTeamIntent) => crud.value?.openAction(intent),
})
const pending = computed(() => derived.value.status === 'loading')
</script>
