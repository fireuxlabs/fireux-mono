<template>
  <section v-if="editor" class="space-y-3">
    <h3 class="font-semibold">Assigned roles</h3>
    <div class="flex flex-wrap gap-2">
      <UCheckbox
        v-for="role in editor.roles"
        :key="role.id"
        :label="role.name"
        :model-value="editor.selected.includes(role.id)"
        :disabled="editor.busy || editor.pending || !memberId"
        @update:model-value="editor.toggleRole(role.id)"
      />
    </div>
    <p v-if="!editor.roles.length" class="text-sm text-muted">
      Add roles in Team roles below.
    </p>
    <UButton
      v-if="editor.assignmentChanged"
      label="Save roles"
      :loading="editor.busy"
      @click="editor.saveAssignment()"
    />
  </section>
</template>
<script setup lang="ts">
import type WorkspaceTeamRoles from './Roles.vue'
defineProps<{
  editor?: InstanceType<typeof WorkspaceTeamRoles>
  memberId: string
}>()
</script>
