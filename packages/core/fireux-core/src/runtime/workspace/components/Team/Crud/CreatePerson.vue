<template>
  <form class="space-y-4" @submit.prevent="createNamedPerson">
    <UFormField
      label="Find a person"
      hint="Search existing Users before adding a new name."
    >
      <UInput
        v-model="query"
        :readonly="Boolean(savingId)"
        icon="i-lucide-search"
        placeholder="Name or handle"
        :autofocus="autofocus"
        autocomplete="off"
        maxlength="120"
      />
    </UFormField>

    <slot />

    <div v-if="matchingPeople.length" class="grid gap-2">
      <UButton
        v-for="person in matchingPeople"
        :key="person.id"
        type="button"
        color="neutral"
        variant="soft"
        block
        class="justify-start"
        :loading="savingId === person.id"
        :disabled="Boolean(savingId)"
        @click="selectPerson(person)"
      >
        <UAvatar
          :src="person.avatar || undefined"
          :alt="person.display_name"
          size="sm"
        />
        <span class="min-w-0 text-left">
          <span class="block truncate font-medium">{{
            person.display_name || person.handle
          }}</span>
          <span class="block truncate text-xs text-dimmed"
            >@{{ person.handle }}</span
          >
        </span>
      </UButton>
    </div>

    <UAlert
      v-if="directoryError"
      title="Existing people could not be searched"
      description="You can still add an unlinked name."
      color="warning"
      variant="soft"
    />

    <div class="flex flex-wrap items-center justify-between gap-2">
      <UButton
        v-if="cancellable"
        type="button"
        color="neutral"
        variant="ghost"
        :disabled="Boolean(savingId)"
        @click="emit('cancel')"
      >
        Cancel
      </UButton>
      <UButton
        type="submit"
        icon="i-lucide-user-plus"
        :loading="savingId === 'named'"
        :disabled="!normalizedQuery || Boolean(savingId)"
      >
        {{ prepareOnly ? 'Choose' : 'Add' }} “{{ normalizedQuery || 'name' }}”
      </UButton>
    </div>

    <UAlert
      v-if="message"
      :title="
        prepareOnly ? 'Could not choose person' : 'Could not add team member'
      "
      :description="message"
      color="error"
      variant="soft"
    />
    <FireCopyError v-if="message" :message="message" />
  </form>
</template>

<script setup lang="ts">
import { computed, onScopeDispose, ref } from 'vue'
import type { CollectionResponse } from '../../../../models/utils/directory'
import type { User } from '../../../../user/models/user.model'

const props = defineProps<{
  active?: boolean
  cancellable?: boolean
  autofocus?: boolean
  prepareOnly?: boolean
  initialName?: string
  create: (input: { name: string; userId?: string }) => Promise<unknown>
}>()
const emit = defineEmits<{ cancel: []; created: [result: unknown] }>()
const query = ref(props.initialName || '')
const savingId = ref('')
const message = ref('')
let disposed = false
onScopeDispose(() => {
  disposed = true
})
const { data, error } = await useFetch<CollectionResponse<User>>('/api/users', {
  query: { limit: 200 },
  server: false,
})
const normalizedQuery = computed(() => query.value.trim().replace(/\s+/g, ' '))
const directoryError = computed(() => Boolean(error.value))
const matchingPeople = computed(() => {
  const needle = normalizedQuery.value.toLocaleLowerCase()
  if (needle.length < 2) return []
  return (data.value?.items || [])
    .filter((person: User) =>
      `${person.display_name} ${person.handle}`
        .toLocaleLowerCase()
        .includes(needle)
    )
    .slice(0, 8)
})

async function submit(
  input: { name: string; userId?: string },
  saving: string
) {
  if (props.active === false || savingId.value) return
  savingId.value = saving
  message.value = ''
  try {
    const result = await props.create({ ...input })
    if (disposed) return
    emit('created', result)
    query.value = ''
  } catch (cause) {
    if (disposed) return
    message.value =
      cause instanceof Error ? cause.message : 'Add team member failed.'
  } finally {
    savingId.value = ''
  }
}
function selectPerson(person: User) {
  return submit(
    { name: person.display_name || person.handle, userId: person.id },
    person.id
  )
}
function createNamedPerson() {
  if (!normalizedQuery.value) return
  return submit({ name: normalizedQuery.value }, 'named')
}
</script>
