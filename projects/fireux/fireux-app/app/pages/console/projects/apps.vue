<template>
  <UDashboardPanel id="console-projects-apps">
    <template #header>
      <LayoutsConsoleNavbar title="Project Apps" />
    </template>

    <template #body>
      <section class="space-y-6">
        <UCard>
          <template #header>
            <div class="text-sm font-semibold">App management</div>
          </template>

          <div class="flex flex-wrap gap-2">
            <UButton
              v-if="isWritableMode"
              :to="actions.createAppTo"
              icon="i-lucide-plus"
              variant="soft"
              color="primary"
            >
              Create app
            </UButton>
            <UButton
              to="/apps"
              icon="i-lucide-app-window"
              variant="ghost"
              color="neutral"
            >
              Open public index
            </UButton>
          </div>
        </UCard>

        <UAlert
          v-if="!appRows.length"
          color="neutral"
          variant="soft"
          title="No apps found"
          description="Create your first app from the project console."
        />

        <UCard
          v-for="app in appRows"
          :key="app.id"
        >
          <template #header>
            <div class="flex items-start justify-between gap-3">
              <div class="space-y-1">
                <div class="text-sm font-semibold">{{ app.name }}</div>
                <div class="text-xs text-dimmed font-mono">{{ app.id }}</div>
              </div>
              <UBadge variant="soft">{{ app.status }}</UBadge>
            </div>
          </template>

          <div class="grid gap-3 sm:grid-cols-[minmax(0,1fr)_220px_auto] sm:items-end">
            <div class="text-xs text-dimmed">
              Current ecosystem:
              <span class="font-medium">{{ app.ecosystemId || 'unassigned' }}</span>
            </div>

            <div class="space-y-1">
              <div class="text-xs text-dimmed">Assign ecosystem</div>
              <select
                v-model="assignmentDraft[app.id]"
                class="w-full rounded border border-default bg-default px-2 py-1.5 text-sm"
              >
                <option value="">Unassigned</option>
                <option
                  v-for="item in ecosystemOptions"
                  :key="item.id"
                  :value="item.id"
                >
                  {{ item.name }}
                </option>
              </select>
            </div>

            <UButton
              size="sm"
              variant="soft"
              color="primary"
              icon="i-lucide-save"
              :loading="Boolean(savePending[app.id])"
              :disabled="!isWritableMode || !isDirty(app.id, app.ecosystemId)"
              @click="assignEcosystem(app.id)"
            >
              Save
            </UButton>
          </div>
        </UCard>
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { computed, reactive, watchEffect } from 'vue'
import { useToastify } from 'fireux-core/runtime/composables/fireux/app/ui/useToastify'
import { useRuntimeProjectConsole } from 'fireux-core/runtime/composables/fireux/app/runtime-project/useRuntimeProjectConsole'
import { useFirestoreUpdate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreUpdate'

definePageMeta({
  layout: 'console',
  nav: {
    visibility: { ecosystems: ['fireux'] },
    key: 'console-projects-apps',
    label: 'Apps',
    icon: 'i-lucide-app-window',
    order: 30,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})

const { runtime, appRows, ecosystemRows, actions } = useRuntimeProjectConsole()
const { updateDocument } = useFirestoreUpdate()
const toast = useToastify()
const isWritableMode = computed(() => runtime.mode.value === 'live')

const assignmentDraft = reactive<Record<string, string>>({})
const savePending = reactive<Record<string, boolean>>({})

watchEffect(() => {
  for (const app of appRows.value) {
    if (assignmentDraft[app.id] !== undefined) continue
    assignmentDraft[app.id] = String(app.ecosystemId || '').trim()
  }
})

const ecosystemOptions = computed(() =>
  ecosystemRows.value.map((row) => ({
    id: row.id,
    name: row.name,
  }))
)

const isDirty = (appId: string, currentEcosystemId: string) => {
  const next = String(assignmentDraft[appId] || '').trim()
  const current = String(currentEcosystemId || '').trim()
  return next !== current
}

const assignEcosystem = async (appId: string) => {
  if (!isWritableMode.value) return
  const nextEcosystemId = String(assignmentDraft[appId] || '').trim()
  if (!appId) return

  savePending[appId] = true
  try {
    await updateDocument<Record<string, unknown>>('apps', appId, {
      ecosystem: nextEcosystemId,
      ecosystem_id: nextEcosystemId,
    })
    toast.success('App ecosystem updated')
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    toast.error(`Failed to update app ecosystem: ${message}`)
  } finally {
    savePending[appId] = false
  }
}
</script>
