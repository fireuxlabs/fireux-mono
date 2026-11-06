<template>
  <section v-if="editor" class="space-y-3">
    <h3>Assigned roles</h3>
    <div class="fx-card__actions">
      <UCheckbox
        v-for="role in editor.roles"
        :key="role.id"
        :label="role.name"
        :model-value="editor.selected.includes(role.id)"
        :disabled="editor.busy || editor.pending || !memberId"
        @update:model-value="editor.toggleRole(role.id)"
      />
    </div>
    <p v-if="!editor.roles.length">Add roles in Team roles below.</p>
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
