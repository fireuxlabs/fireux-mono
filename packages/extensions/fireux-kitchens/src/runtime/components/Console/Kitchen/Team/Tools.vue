<template>
  <section class="space-y-3" aria-labelledby="team-tools-title">
    <div
      class="flex items-center gap-3 rounded-xl border border-default bg-elevated/50 p-2 shadow-sm"
    >
      <div class="min-w-0 px-2">
        <h2
          id="team-tools-title"
          class="text-xs font-semibold uppercase tracking-wide text-muted"
        >
          Tools
        </h2>
        <p class="hidden text-xs text-dimmed sm:block">Team actions</p>
      </div>

      <div
        class="flex items-center gap-1 border-l border-default pl-3"
        role="toolbar"
        aria-label="Team tools"
      >
        <UTooltip :text="addMemberTooltip">
          <UButton
            icon="i-lucide-user-plus"
            color="neutral"
            :variant="addMemberOpen ? 'soft' : 'ghost'"
            size="lg"
            class="min-h-11 min-w-11 justify-center px-3 sm:size-11 sm:p-0"
            aria-label="Add team member"
            :aria-pressed="addMemberOpen"
            :disabled="!canWrite"
            @click="addMemberOpen = !addMemberOpen"
          >
            <span class="sm:hidden">Add member</span>
          </UButton>
        </UTooltip>
      </div>
    </div>

    <UModal
      v-model:open="addMemberOpen"
      title="Add team member"
      description="Add an operational person record. This does not grant Misebox or Console access."
      :ui="{ content: 'sm:max-w-lg' }"
    >
      <template #body>
        <ConsoleKitchenTeamWrite
          v-if="canWrite"
          :kitchen-id="kitchenId"
          @cancel="addMemberOpen = false"
          @created="handleMemberCreated"
        />
      </template>
    </UModal>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useKitchenConsoleTeam } from '../../../../composables/fireux/console/kitchen/team/useKitchenConsoleTeam'

const addMemberOpen = ref(false)
const { kitchenId, canWrite } = useKitchenConsoleTeam()
const toast = useToast()
const addMemberTooltip = computed(() =>
  canWrite.value ? 'Add team member' : 'Write access is required'
)
const handleMemberCreated = (result: { name: string }) => {
  addMemberOpen.value = false
  toast.add({
    title: `${result.name} added`,
    description: 'The new member is now part of this Kitchen team.',
    color: 'success',
    icon: 'i-lucide-user-check',
  })
}
</script>
