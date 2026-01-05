<template>
  <ClientOnly>
    <div v-if="app" class="space-y-6">
      <!-- TODO: make it easy for admins to change image without a dev -->

      <!-- Images -->
      <MoleculesFormsFirestoreAppImages :app="app" />

      <UCard class="fx-section" variant="subtle">
        <template #header>
          <div class="fx-section__header">
            <div class="fx-section__copy">
              <h3 class="text-base font-semibold">Field groups (draft)</h3>
              <p class="text-xs text-gray-500">
                Proposed separation to prevent “locked” values leaking into editable surfaces.
                Confirm what should be editable and I’ll enforce it.
              </p>
            </div>
          </div>
        </template>

        <div class="fx-section__item">
          <div class="grid gap-4 sm:grid-cols-2">
            <div>
              <div class="text-xs font-medium text-gray-600">Locked (config/system)</div>
              <ul class="mt-2 space-y-1 text-sm text-gray-700">
                <li>
                  <span class="font-mono">id</span>, <span class="font-mono">role</span>,
                  <span class="font-mono">ecosystem</span>
                </li>
                <li>
                  <span class="font-mono">creator_id</span>,
                  <span class="font-mono">created_by</span>
                </li>
                <li>
                  <span class="font-mono">created_at</span>,
                  <span class="font-mono">updated_at</span>
                </li>
                <li>
                  <span class="font-mono">admin_ids</span>,
                  <span class="font-mono">user_count</span>,
                  <span class="font-mono">join_requests</span>
                </li>
              </ul>
            </div>

            <div>
              <div class="text-xs font-medium text-gray-600">Editable (public-facing content)</div>
              <ul class="mt-2 space-y-1 text-sm text-gray-700">
                <li>
                  <span class="font-mono">app_name</span>,
                  <span class="font-mono">app_short_name</span>
                </li>
                <li>
                  <span class="font-mono">tagline</span>,
                  <span class="font-mono">description</span>
                </li>
                <li>
                  <span class="font-mono">short_bio</span>,
                  <span class="font-mono">long_bio</span>
                </li>
                <li><span class="font-mono">social_links.instagram</span></li>
              </ul>
            </div>
          </div>
        </div>
      </UCard>

      <UCard class="fx-section">
        <template #header>
          <div class="fx-section__header">
            <div class="fx-section__copy">
              <h3 class="text-base font-semibold">Model</h3>
              <p class="text-xs text-gray-500">Full app document.</p>
            </div>
          </div>
        </template>

        <div class="fx-section__item">
          <pre class="text-xs font-mono text-gray-600 whitespace-pre-wrap break-words">{{ appModelJson }}</pre>
        </div>
      </UCard>
    </div>

    <MoleculesStateCard v-else entity="developer settings" kind="document" loading />
  </ClientOnly>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { App } from '../../../models/core/app.model'

const props = withDefaults(defineProps<{ app?: App | null }>(), { app: null })
const app = computed(() => props.app)

const appModelJson = computed(() => JSON.stringify(app.value ?? null, null, 2))
</script>
