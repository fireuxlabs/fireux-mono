<template>
  <div v-if="pageState" class="grid gap-4">
    <section
      v-for="section in sections"
      :key="section"
      v-show="section in pageState"
    >
      <h3 class="font-semibold capitalize">{{ section }}</h3>
      <pre class="overflow-auto text-xs">{{
        JSON.stringify(pageState[section], null, 2)
      }}</pre>
    </section>
  </div>
  <section
    v-if="capability"
    class="grid gap-3"
    aria-labelledby="capability-context-title"
  >
    <div>
      <h3 id="capability-context-title" class="m-0 font-semibold">
        {{ capability.subject }} capability
      </h3>
      <p class="m-0 text-sm text-muted">{{ capability.id }}</p>
    </div>

    <div class="grid gap-2">
      <p class="m-0 text-sm font-medium text-toned">Primitives</p>
      <ul class="m-0 grid gap-2 p-0" aria-label="Page primitives">
        <li
          v-for="primitive in primitives"
          :key="primitive.id"
          class="flex items-center justify-between gap-3 text-sm"
        >
          <span class="capitalize">{{ primitive.id }}</span>
          <UBadge
            :color="primitive.available ? 'success' : 'neutral'"
            variant="subtle"
          >
            {{ primitive.available ? 'Available' : 'Unavailable' }}
          </UBadge>
        </li>
      </ul>
    </div>

    <div v-if="capability.natives.length" class="grid gap-2">
      <p class="m-0 text-sm font-medium text-toned">Capability natives</p>
      <ul class="m-0 grid gap-1 pl-5 text-sm text-muted">
        <li v-for="native in capability.natives" :key="native.id">
          {{ nativeLabel(native.id) }} · {{ native.primitive }}
        </li>
      </ul>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useWorkspaceNav } from '../../composables/fireux/workspace/useWorkspaceNav'
import { useWorkspacePageState } from '../../composables/fireux/workspace/useWorkspacePageState'
import type { WorkspaceCapabilityContext } from '../../composables/fireux/workspace/workspaceCapabilityContext'

const sections = ['workspace', 'collection', 'selected', 'derived'] as const
const workspaceNav = useWorkspaceNav()
const { state: pageState } = useWorkspacePageState(
  workspaceNav.currentWorkspace.value
)
const capability = computed(() => {
  const derived = pageState.value?.derived
  if (!derived || typeof derived !== 'object') return null
  const value = (derived as Record<string, unknown>).capability
  return value && typeof value === 'object'
    ? (value as WorkspaceCapabilityContext)
    : null
})
const primitives = computed(() =>
  capability.value
    ? (['create', 'read', 'update', 'delete'] as const).map((id) => ({
        id,
        ...capability.value!.primitives[id],
      }))
    : []
)
const nativeLabel = (id: string) =>
  id
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
</script>
