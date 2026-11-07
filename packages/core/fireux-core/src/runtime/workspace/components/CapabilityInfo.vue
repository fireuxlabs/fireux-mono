<template>
  <div v-if="pageState">
    <section
      v-for="section in sections"
      :key="section"
      v-show="section in pageState"
    >
      <h3>{{ section }}</h3>
      <pre class="overflow-auto">{{
        JSON.stringify(pageState[section], null, 2)
      }}</pre>
    </section>
  </div>
  <section v-if="capability" aria-labelledby="capability-context-title">
    <div>
      <h3 id="capability-context-title">{{ capability.subject }} capability</h3>
      <p>{{ capability.id }}</p>
    </div>

    <div>
      <p>Primitives</p>
      <ul aria-label="Page primitives">
        <li v-for="primitive in primitives" :key="primitive.id">
          <span>{{ primitive.id }}</span>
          <UBadge
            :color="primitive.available ? 'success' : 'neutral'"
            variant="subtle"
          >
            {{ primitive.available ? 'Available' : 'Unavailable' }}
          </UBadge>
        </li>
      </ul>
    </div>

    <div v-if="capability.natives.length">
      <p>Capability natives</p>
      <ul class="fx-list-stack">
        <li v-for="native in capability.natives" :key="native.id">
          {{ nativeLabel(native.id) }} · {{ native.primitive }}
        </li>
      </ul>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useWorkspaceNav } from '../composables/useWorkspaceNav'
import { useWorkspacePageState } from '../composables/useWorkspacePageState'
import type { WorkspaceCapabilityContext } from '../models/capability-context'

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
