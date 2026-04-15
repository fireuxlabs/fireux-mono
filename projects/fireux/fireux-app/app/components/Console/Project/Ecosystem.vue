<template>
  <section class="console-surface">
    <UAlert
      v-if="!projectId"
      color="neutral"
      variant="soft"
      title="No project selected"
      description="Choose a project in the console first to inspect its ecosystem facade."
    />

    <UAlert
      v-else-if="!runtimeData.ecosystemId"
      color="warning"
      variant="soft"
      title="No ecosystem linked"
      description="The selected project does not currently point to a public ecosystem facade."
    />

    <template v-else>
      <UCard>
        <template #header>
          <div class="console-card-header">
            <div class="console-card-header__title">Project Context</div>
            <p class="console-card-header__description">
              The selected project and the ecosystem id it currently points to.
            </p>
          </div>
        </template>

        <div class="console-summary-grid">
          <div class="console-summary-field">
            Project ID:
            <span class="console-summary-value">{{ projectId }}</span>
          </div>

          <div v-if="projectName" class="console-summary-field">
            Name:
            <span class="console-summary-value">{{ projectName }}</span>
          </div>

          <div v-if="projectSlug" class="console-summary-field">
            Slug:
            <span class="console-summary-value">{{ projectSlug }}</span>
          </div>

          <div class="console-summary-field">
            Ecosystem ID:
            <span class="console-summary-value">{{ runtimeData.ecosystemId }}</span>
          </div>

          <div v-if="projectStatus" class="console-summary-field">
            Status:
            <span class="console-summary-value">{{ projectStatus }}</span>
          </div>

          <div
            v-if="consoleEndpoint"
            class="console-summary-field console-summary-field--full"
          >
            Console Endpoint:
            <span class="console-summary-value break-all">{{ consoleEndpoint }}</span>
          </div>

          <div
            v-if="projectDescription"
            class="console-summary-field console-summary-field--full"
          >
            Description:
            <span class="console-summary-value">{{ projectDescription }}</span>
          </div>
        </div>
      </UCard>

      <UCard>
        <template #header>
          <div class="console-card-header">
            <div class="console-card-header__title">Public Ecosystem Facade</div>
            <p class="console-card-header__description">
              Root ecosystem data fetched from the canonical public collection.
            </p>
          </div>
        </template>

        <div v-if="runtimeData.ecosystemPending" class="console-card-header__description">
          Loading ecosystem facade...
        </div>

        <div v-else-if="runtimeData.ecosystem" class="space-y-4">
          <EcosystemCardsPill
            v-if="ecosystemCard"
            v-bind="ecosystemCard"
            :link="false"
          />

          <div class="console-summary-grid">
            <div class="console-summary-field">
              Ecosystem ID:
              <span class="console-summary-value">{{ ecosystemRecordId }}</span>
            </div>

            <div v-if="ecosystemName" class="console-summary-field">
              Name:
              <span class="console-summary-value">{{ ecosystemName }}</span>
            </div>

            <div v-if="ecosystemSlug" class="console-summary-field">
              Slug:
              <span class="console-summary-value">{{ ecosystemSlug }}</span>
            </div>

            <div v-if="ecosystemProjectId" class="console-summary-field">
              Project ID:
              <span class="console-summary-value">{{ ecosystemProjectId }}</span>
            </div>

            <div v-if="ecosystemStatus" class="console-summary-field">
              Status:
              <span class="console-summary-value">{{ ecosystemStatus }}</span>
            </div>

            <div v-if="ecosystemTeam" class="console-summary-field">
              Team:
              <span class="console-summary-value">{{ ecosystemTeam }}</span>
            </div>

            <div class="console-summary-field">
              Apps:
              <span class="console-summary-value">{{ ecosystemAppCount }}</span>
            </div>

            <div
              v-if="ecosystemSourceUrl"
              class="console-summary-field console-summary-field--full"
            >
              Source URL:
              <span class="console-summary-value break-all">{{ ecosystemSourceUrl }}</span>
            </div>

            <div
              v-if="ecosystemDescription"
              class="console-summary-field console-summary-field--full"
            >
              Description:
              <span class="console-summary-value">{{ ecosystemDescription }}</span>
            </div>
          </div>
        </div>

        <p v-else class="console-card-header__description">
          No public ecosystem facade was found for
          <span class="console-summary-value">{{ runtimeData.ecosystemId }}</span>.
        </p>
      </UCard>

      <div class="console-surface__grid console-surface__grid--2">
        <UCard>
          <template #header>
            <div class="console-card-header__title">Project JSON</div>
          </template>

          <pre class="console-code">{{ projectDump }}</pre>
        </UCard>

        <UCard>
          <template #header>
            <div class="console-card-header__title">Ecosystem JSON</div>
          </template>

          <pre class="console-code">{{ ecosystemDump }}</pre>
        </UCard>
      </div>
    </template>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useProjectConsole } from 'fireux-core/runtime/composables/fireux/app/project-console/useProjectConsole'
import { useRuntimeProjectData } from 'fireux-core/runtime/composables/fireux/app/project-console/useRuntimeProjectData'
import { useEcosystemInterface } from 'fireux-core/runtime/composables/fireux/firestore/system/ecosystem/utils/view/useEcosystemInterface'

const { projectState, project } = useProjectConsole()
const runtimeData = useRuntimeProjectData({
  id: projectState.id,
  project: projectState.project,
})
const { pill: makeEcosystemCard } = useEcosystemInterface()

const safeString = (value: unknown) => String(value ?? '').trim()
const toDebugJson = (value: unknown) => JSON.stringify(value, null, 2)

const projectId = computed(() => projectState.id.value)
const projectName = computed(() => safeString(project.value?.name))
const projectSlug = computed(() => safeString(project.value?.slug))
const projectStatus = computed(() => safeString(project.value?.status))
const projectDescription = computed(() => safeString(project.value?.description))
const consoleEndpoint = computed(() =>
  safeString(project.value?.console_endpoint_url || project.value?.source_url)
)

const ecosystemRecordId = computed(() => safeString(runtimeData.value.ecosystem?.id))
const ecosystemProjectId = computed(() => safeString(runtimeData.value.ecosystem?.project_id))
const ecosystemName = computed(() => safeString(runtimeData.value.ecosystem?.name))
const ecosystemSlug = computed(() => safeString(runtimeData.value.ecosystem?.slug))
const ecosystemStatus = computed(() => safeString(runtimeData.value.ecosystem?.status))
const ecosystemTeam = computed(() => safeString(runtimeData.value.ecosystem?.team))
const ecosystemDescription = computed(() => safeString(runtimeData.value.ecosystem?.description))
const ecosystemSourceUrl = computed(() => safeString(runtimeData.value.ecosystem?.source_url))
const ecosystemAppCount = computed(() => {
  const apps = runtimeData.value.ecosystem?.apps
  return Array.isArray(apps) ? String(apps.length) : '0'
})

const ecosystemCard = computed(() =>
  runtimeData.value.ecosystem
    ? makeEcosystemCard({
        ...runtimeData.value.ecosystem,
        src: safeString(runtimeData.value.ecosystem.image_url),
        text: ecosystemName.value || ecosystemSlug.value || ecosystemRecordId.value,
        href: '',
      })
    : null
)

const projectDump = computed(() =>
  toDebugJson({
    pending: projectState.pending.value,
    id: projectId.value,
    ecosystemId: runtimeData.value.ecosystemId,
    project: project.value,
  })
)

const ecosystemDump = computed(() =>
  toDebugJson({
    pending: runtimeData.value.ecosystemPending,
    ecosystem: runtimeData.value.ecosystem,
  })
)
</script>
