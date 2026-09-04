<template>
  <section
    class="space-y-4 rounded-xl border-2 border-error bg-error/10 p-4 text-highlighted shadow-sm shadow-error/10 sm:p-5"
    aria-labelledby="team-tool-map-title"
  >
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div class="space-y-1">
        <p class="m-0 text-xs font-semibold uppercase tracking-wide text-error">
          Temporary organising block
        </p>
        <h2 id="team-tool-map-title" class="m-0 text-lg font-semibold">
          Team tool map
        </h2>
        <p class="m-0 text-sm text-toned">
          Delete this pink section when Human tools, suggestions, and AI tools
          are settled in their permanent locations.
        </p>
      </div>
      <UBadge color="error" variant="soft">Delete later</UBadge>
    </div>

    <div class="grid gap-3 lg:grid-cols-3">
      <article class="rounded-lg border border-error/30 bg-default/70 p-4">
        <h3 class="m-0 text-sm font-semibold">Human tools</h3>
        <ul class="mt-3 grid gap-3">
          <li v-for="tool in humanTools" :key="tool.name" class="grid gap-0.5">
            <span class="flex items-center gap-1.5 text-sm font-medium">
              <UIcon
                v-if="tool.complete"
                name="i-lucide-circle-check"
                class="size-4 text-success"
              />
              {{ tool.name }}
            </span>
            <span class="text-xs text-muted">
              {{ tool.placement }}
            </span>
          </li>
        </ul>
      </article>

      <article class="rounded-lg border border-error/30 bg-default/70 p-4">
        <h3 class="m-0 text-sm font-semibold">Contextual suggestions</h3>
        <ul v-if="suggestions.length" class="mt-3 grid gap-3">
          <li
            v-for="suggestion in suggestions"
            :key="suggestion"
            class="text-sm"
          >
            {{ suggestion }}
          </li>
        </ul>
        <p v-else class="mt-3 text-sm text-muted">
          No current Team record suggests an action.
        </p>
      </article>

      <article class="rounded-lg border border-error/30 bg-default/70 p-4">
        <h3 class="m-0 text-sm font-semibold">AI tools</h3>
        <div class="mt-3 grid gap-2">
          <span class="text-sm font-medium">Onboard member from dossier</span>
          <span class="text-xs text-muted">
            Read a PDF or image, prepare a member draft, then ask a human to
            review it before Create member runs.
          </span>
          <UButton
            label="Onboard from dossier"
            icon="i-lucide-file-user"
            color="neutral"
            variant="soft"
            size="sm"
            class="mt-1 w-fit"
            :disabled="!canWrite"
            @click="onboardMemberOpen = true"
          />
        </div>
      </article>
    </div>

    <UModal
      v-model:open="onboardMemberOpen"
      title="Onboard member"
      description="Prepare a Team member from a dossier."
      :ui="{ content: 'sm:max-w-2xl' }"
    >
      <template #body>
        <WorkspaceKitchenTeamDossierOnboarding
          v-if="canWrite"
          @created="handleOnboardedMember"
        />
      </template>
    </UModal>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useKitchenTeamData } from '../../../composables/workspace/team/useKitchenTeamData'

const humanTools = [
  { name: 'Create member', placement: 'Operation toolbar', complete: true },
  { name: 'Read member', placement: 'Collection and record', complete: true },
  {
    name: 'Update member',
    placement: 'Record or detail page',
    complete: false,
  },
  {
    name: 'Deactivate member',
    placement: 'Record or detail page',
    complete: false,
  },
] as const

const onboardMemberOpen = ref(false)
const { teamMembers, canWrite } = useKitchenTeamData()
const toast = useToast()
const suggestions = computed(() => {
  if (!teamMembers.value.length) return ['Create the first Team member.']
  return teamMembers.value
    .filter((member) => !member.user_id)
    .slice(0, 5)
    .map(
      (member) =>
        `Invite ${String(member.display_name || member.name || 'this member').trim()} to link an account.`
    )
})

const handleOnboardedMember = (result: { name: string }) => {
  onboardMemberOpen.value = false
  toast.add({
    title: `${result.name} added`,
    description: 'The reviewed dossier draft is now a Team member.',
    color: 'success',
    icon: 'i-lucide-user-check',
  })
}
</script>
