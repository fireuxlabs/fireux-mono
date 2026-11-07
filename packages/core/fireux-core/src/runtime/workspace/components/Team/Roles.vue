<template>
  <section aria-label="Team role assignments">
    <div>
      <h2>Team roles</h2>
      <UButton
        v-if="!compact"
        label="Edit roles"
        icon="i-lucide-settings-2"
        color="neutral"
        variant="ghost"
        size="sm"
        @click="manageOpen = true"
      />
    </div>
    <h3 v-if="workspaceName">
      {{ workspaceName }}
    </h3>
    <FireState
      v-if="pending && !roles.length"
      outcome="pending"
      entity="Team roles"
    />
    <form
      v-else-if="roles.length && !compact"
      @submit.prevent="mutate({ action: 'assign', roleIds: selected })"
    >
      <p>
        {{
          memberName
            ? `Choose roles for ${memberName}.`
            : 'Select a person to assign roles.'
        }}
      </p>
      <div class="fx-card__actions" aria-label="Workspace roles">
        <UButton
          v-for="role in roles"
          :key="role.id"
          :label="role.name"
          :icon="
            selected.includes(role.id) ? 'i-lucide-check' : 'i-lucide-plus'
          "
          :variant="selected.includes(role.id) ? 'solid' : 'outline'"
          :color="selected.includes(role.id) ? 'primary' : 'neutral'"
          :aria-pressed="selected.includes(role.id)"
          :disabled="!memberId || busy || pending"
          @click="toggleRole(role.id)"
        />
      </div>
      <div v-if="assignmentChanged">
        <UButton
          type="submit"
          label="Save roles"
          :loading="busy"
          :disabled="pending"
        />
        <UButton
          label="Cancel"
          color="neutral"
          variant="ghost"
          :disabled="busy"
          @click="selected = [...saved]"
        />
        <span>Unsaved changes</span>
      </div>
    </form>
    <div
      v-if="compact && roles.length"
      class="fx-card__actions"
      aria-label="Workspace role catalogue"
    >
      <UBadge
        v-for="role in roles"
        :key="role.id"
        color="neutral"
        variant="subtle"
        >{{ role.name }}</UBadge
      >
    </div>
    <div v-if="!pending && remainingSuggestions.length" class="pagebody">
      <p>
        {{
          roles.length
            ? 'Add another role'
            : 'Start with the roles your team uses'
        }}
      </p>
      <div class="fx-card__actions" aria-label="Suggested roles">
        <UButton
          v-for="name in remainingSuggestions"
          :key="name"
          :draggable="compact"
          @dragstart="startSuggestion($event, name)"
          :label="name"
          :aria-label="`Add ${name} role`"
          icon="i-lucide-plus"
          color="neutral"
          variant="soft"
          size="sm"
          :disabled="busy"
          @click="mutate({ action: 'create', name })"
        />
        <UButton
          v-if="!compact"
          label="Custom role"
          icon="i-lucide-plus"
          color="neutral"
          variant="ghost"
          size="sm"
          @click="manageOpen = true"
        />
      </div>
    </div>
    <div v-if="error && !manageOpen" role="alert">
      {{ error }} <FireCopyError :message="error" />
      <UButton label="Retry" variant="link" size="sm" @click="load()" />
    </div>
    <p v-if="notice && !manageOpen" role="status">
      {{ notice }}
    </p>
    <form
      v-if="compact"
      class="fx-card__actions"
      @submit.prevent="addRole"
      @dragover.prevent
      @drop.prevent="dropSuggestion"
    >
      <UInput
        v-model="newName"
        placeholder="New role"
        aria-label="New role"
        maxlength="80"
      />
      <UButton
        type="submit"
        icon="i-lucide-plus"
        aria-label="Add role"
        :disabled="busy || pending || !newName.trim()"
      />
    </form>
    <UModal
      v-if="!compact"
      v-model:open="manageOpen"
      title="Manage team roles"
      description="Choose suggestions or add your own. Roles organise people; they do not change access."
    >
      <template #body>
        <div class="pagebody">
          <div v-if="error" role="alert">
            {{ error }} <FireCopyError :message="error" />
          </div>
          <form class="fx-card__actions" @submit.prevent="addRole">
            <UInput
              v-model="newName"
              aria-label="New role name"
              placeholder="Role name"
              maxlength="80"
              :disabled="busy || pending"
              autofocus
            />
            <UButton
              type="submit"
              label="Add"
              icon="i-lucide-plus"
              :disabled="!newName.trim() || busy || pending"
            />
          </form>
          <div v-if="roles.length" class="pagebody">
            <h3>Workspace roles · {{ roles.length }}</h3>
            <div v-for="role in roles" :key="role.id">
              <template v-if="editingId === role.id">
                <UInput
                  v-model="names[role.id]"
                  :aria-label="`Rename ${role.name}`"
                  maxlength="80"
                  :disabled="busy"
                />
                <UButton
                  label="Save"
                  size="sm"
                  :disabled="
                    busy ||
                    !names[role.id]?.trim() ||
                    names[role.id] === role.name
                  "
                  @click="
                    mutate({
                      action: 'rename',
                      roleId: role.id,
                      name: names[role.id],
                    })
                  "
                />
                <UButton
                  label="Cancel"
                  size="sm"
                  color="neutral"
                  variant="ghost"
                  :disabled="busy"
                  @click="editingId = ''"
                />
              </template>
              <template v-else>
                <span>{{ role.name }}</span>
                <UButton
                  v-if="!['dev', 'operator'].includes(role.id)"
                  icon="i-lucide-pencil"
                  :aria-label="`Rename ${role.name}`"
                  color="neutral"
                  variant="ghost"
                  size="sm"
                  :disabled="busy"
                  @click="beginRename(role)"
                />
              </template>
            </div>
          </div>
          <p v-if="notice" role="status">
            {{ notice }}
          </p>
        </div>
      </template>
    </UModal>
  </section>
</template>
<script setup lang="ts">
import { refreshNuxtData } from 'nuxt/app'

import { computed, ref, watch } from 'vue'
import { useRequireUser } from '../../../composables/fireux/firebase/useRequireUser'
const props = defineProps<{
  compact?: boolean
  endpoint: string
  workspaceName?: string
  workspaceId: string
  memberId: string
  memberName?: string
  suggestions: string[]
}>()
const emit = defineEmits<{ labels: [value: Record<string, string[]>] }>()
const manageOpen = ref(false)
const editingId = ref('')
const roles = ref<{ id: string; name: string }[]>([])
const names = ref<Record<string, string>>({})
const selected = ref<string[]>([])
const saved = ref<string[]>([])
const newName = ref('')
const error = ref('')
const notice = ref('')
const pending = ref(false)
const busy = ref(false)
let revision = 0
const assignmentChanged = computed(
  () =>
    JSON.stringify([...selected.value].sort()) !==
    JSON.stringify([...saved.value].sort())
)
const remainingSuggestions = computed(() =>
  props.suggestions.filter(
    (name) =>
      !roles.value.some(
        (role: { id: string; name: string }) =>
          role.name.toLowerCase() === name.toLowerCase()
      )
  )
)
async function request(
  input: Record<string, unknown>,
  endpoint: string,
  workspaceId: string,
  memberId: string
) {
  const user = await useRequireUser()
  return $fetch<{
    roles?: { id: string; name: string }[]
    roleIds?: string[]
    labels?: Record<string, string[]>
  }>(endpoint, {
    onResponse: async ({ options, response }) => {
      if (
        response.ok &&
        !['GET', 'HEAD'].includes(String(options.method || 'GET').toUpperCase())
      )
        await refreshNuxtData()
    },
    method: 'POST',
    timeout: 15000,
    retry: 0,
    headers: { authorization: `Bearer ${await user.getIdToken()}` },
    body: { ...input, workspaceId, memberId },
  })
}
async function load(preserveAssignment = false) {
  const draft = [...selected.value]
  const current = ++revision
  error.value = ''
  notice.value = ''
  if (!props.workspaceId) {
    pending.value = false
    return
  }
  pending.value = true
  try {
    const data = await request(
      { action: 'read' },
      props.endpoint,
      props.workspaceId,
      props.memberId
    )
    if (current !== revision) return
    roles.value = data.roles || []
    emit('labels', data.labels || {})
    names.value = Object.fromEntries(
      roles.value.map((role) => [role.id, role.name])
    )
    selected.value = [...(data.roleIds || [])]
    saved.value = [...selected.value]
    if (preserveAssignment)
      selected.value = draft.filter((id: string) =>
        roles.value.some((role: { id: string; name: string }) => role.id === id)
      )
  } catch (cause) {
    if (current === revision)
      error.value = cause instanceof Error ? cause.message : 'Try again.'
  } finally {
    if (current === revision) pending.value = false
  }
}
async function mutate(input: Record<string, unknown>) {
  if (busy.value || pending.value) return
  const current = revision
  busy.value = true
  error.value = ''
  notice.value = ''
  try {
    await request(input, props.endpoint, props.workspaceId, props.memberId)
    if (current !== revision) return
    newName.value = ''
    editingId.value = ''
    await load(input.action !== 'assign')
    if (!error.value)
      notice.value =
        input.action === 'assign'
          ? 'Member roles saved.'
          : input.action === 'rename'
            ? 'Role renamed for everyone assigned to it.'
            : 'Role added to this workspace.'
  } catch (cause) {
    if (current === revision)
      error.value = cause instanceof Error ? cause.message : 'Try again.'
  } finally {
    busy.value = false
  }
}
defineExpose({
  roles,
  selected,
  assignmentChanged,
  busy,
  pending,
  toggleRole,
  saveAssignment: () => mutate({ action: 'assign', roleIds: selected.value }),
})
function toggleRole(id: string) {
  selected.value = selected.value.includes(id)
    ? selected.value.filter((value: string) => value !== id)
    : [...selected.value, id]
}
function beginRename(role: { id: string; name: string }) {
  editingId.value = role.id
  names.value[role.id] = role.name
}
function startSuggestion(event: DragEvent, name: string) {
  event.dataTransfer?.setData('text/plain', name)
}
function dropSuggestion(event: DragEvent) {
  const name = event.dataTransfer?.getData('text/plain') || ''
  if (remainingSuggestions.value.includes(name))
    void mutate({ action: 'create', name })
}
function addRole() {
  return mutate({ action: 'create', name: newName.value })
}
watch(
  () => [props.endpoint, props.workspaceId, props.memberId],
  ([endpoint, workspaceId], previous) => {
    const workspaceChanged =
      !previous || endpoint !== previous[0] || workspaceId !== previous[1]
    if (workspaceChanged) {
      roles.value = []
      names.value = {}
      emit('labels', {})
    }
    selected.value = []
    saved.value = []
    editingId.value = ''
    manageOpen.value = false
    void load()
  },
  { immediate: true }
)
</script>
