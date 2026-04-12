<template>
  <section class="space-y-6">
    <UAlert
      v-if="!projectId"
      color="neutral"
      variant="soft"
      title="No project selected"
      description="Choose a project in the console first to inspect its ecosystem facade."
    />

    <UAlert
      v-else-if="!ecosystemId"
      color="warning"
      variant="soft"
      title="No ecosystem linked"
      description="The selected project does not currently point to a public ecosystem facade."
    />

    <template v-else>
      <UCard>
        <template #header>
          <div class="space-y-1">
            <div class="text-sm font-semibold">Project Context</div>
            <p class="text-sm text-dimmed">
              The selected project and the ecosystem id it currently points to.
            </p>
          </div>
        </template>

        <div class="grid gap-3 text-sm text-dimmed sm:grid-cols-2">
          <div>
            Project ID:
            <span class="font-medium text-default">{{ projectId }}</span>
          </div>

          <div v-if="projectName">
            Name:
            <span class="font-medium text-default">{{ projectName }}</span>
          </div>

          <div v-if="projectSlug">
            Slug:
            <span class="font-medium text-default">{{ projectSlug }}</span>
          </div>

          <div>
            Ecosystem ID:
            <span class="font-medium text-default">{{ ecosystemId }}</span>
          </div>

          <div v-if="projectStatus">
            Status:
            <span class="font-medium text-default">{{ projectStatus }}</span>
          </div>

          <div v-if="consoleEndpoint" class="sm:col-span-2">
            Console Endpoint:
            <span class="font-medium text-default break-all">{{ consoleEndpoint }}</span>
          </div>

          <div v-if="projectDescription" class="sm:col-span-2">
            Description:
            <span class="font-medium text-default">{{ projectDescription }}</span>
          </div>
        </div>
      </UCard>

      <UCard>
        <template #header>
          <div class="space-y-1">
            <div class="text-sm font-semibold">Public Ecosystem Facade</div>
            <p class="text-sm text-dimmed">
              Root ecosystem data fetched from the canonical public collection.
            </p>
          </div>
        </template>

        <div v-if="ecosystemPending" class="text-sm text-dimmed">
          Loading ecosystem facade...
        </div>

        <div v-else-if="ecosystem" class="space-y-4">
          <EcosystemCardsPill
            v-if="ecosystemCard"
            v-bind="ecosystemCard"
            :link="false"
          />

          <div class="grid gap-3 text-sm text-dimmed sm:grid-cols-2">
            <div>
              Ecosystem ID:
              <span class="font-medium text-default">{{ ecosystemRecordId }}</span>
            </div>

            <div v-if="ecosystemName">
              Name:
              <span class="font-medium text-default">{{ ecosystemName }}</span>
            </div>

            <div v-if="ecosystemSlug">
              Slug:
              <span class="font-medium text-default">{{ ecosystemSlug }}</span>
            </div>

            <div v-if="ecosystemProjectId">
              Project ID:
              <span class="font-medium text-default">{{ ecosystemProjectId }}</span>
            </div>

            <div v-if="ecosystemStatus">
              Status:
              <span class="font-medium text-default">{{ ecosystemStatus }}</span>
            </div>

            <div v-if="ecosystemTeam">
              Team:
              <span class="font-medium text-default">{{ ecosystemTeam }}</span>
            </div>

            <div>
              Apps:
              <span class="font-medium text-default">{{ ecosystemAppCount }}</span>
            </div>

            <div v-if="ecosystemSourceUrl" class="sm:col-span-2">
              Source URL:
              <span class="font-medium text-default break-all">{{ ecosystemSourceUrl }}</span>
            </div>

            <div v-if="ecosystemDescription" class="sm:col-span-2">
              Description:
              <span class="font-medium text-default">{{ ecosystemDescription }}</span>
            </div>
          </div>
        </div>

        <p v-else class="text-sm text-dimmed">
          No public ecosystem facade was found for
          <span class="font-medium text-default">{{ ecosystemId }}</span>.
        </p>
      </UCard>

      <div class="grid gap-4 xl:grid-cols-2">
        <UCard>
          <template #header>
            <div class="text-sm font-semibold">Project JSON</div>
          </template>

          <pre class="overflow-auto text-xs">{{ projectDump }}</pre>
        </UCard>

        <UCard>
          <template #header>
            <div class="text-sm font-semibold">Ecosystem JSON</div>
          </template>

          <pre class="overflow-auto text-xs">{{ ecosystemDump }}</pre>
        </UCard>
      </div>
    </template>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useActiveProject } from 'fireux-core/runtime/composables/fireux/app/project-console/useActiveProject'
import { useEcosystemFetch } from 'fireux-core/runtime/composables/fireux/firestore/system/ecosystem/fetch/useEcosystemFetch'
import { useEcosystemInterface } from 'fireux-core/runtime/composables/fireux/firestore/system/ecosystem/utils/view/useEcosystemInterface'

const { id: projectId, project, pending: projectPending } = useActiveProject()
const ecosystemId = computed(() => String(project.value?.ecosystem_id || '').trim())
const { ecosystem, pending: ecosystemPending } = useEcosystemFetch(ecosystemId)
const { interface: makeEcosystemCard } = useEcosystemInterface()

const safeString = (value: unknown) => String(value ?? '').trim()
const toDebugJson = (value: unknown) => JSON.stringify(value, null, 2)

const projectName = computed(() => safeString(project.value?.name))
const projectSlug = computed(() => safeString(project.value?.slug))
const projectStatus = computed(() => safeString(project.value?.status))
const projectDescription = computed(() => safeString(project.value?.description))
const consoleEndpoint = computed(() =>
  safeString(project.value?.console_endpoint_url || project.value?.source_url)
)

const ecosystemRecordId = computed(() => safeString(ecosystem.value?.id))
const ecosystemProjectId = computed(() => safeString(ecosystem.value?.project_id))
const ecosystemName = computed(() => safeString(ecosystem.value?.name))
const ecosystemSlug = computed(() => safeString(ecosystem.value?.slug))
const ecosystemStatus = computed(() => safeString(ecosystem.value?.status))
const ecosystemTeam = computed(() => safeString(ecosystem.value?.team))
const ecosystemDescription = computed(() => safeString(ecosystem.value?.description))
const ecosystemSourceUrl = computed(() => safeString(ecosystem.value?.source_url))
const ecosystemAppCount = computed(() => {
  const apps = ecosystem.value?.apps
  return Array.isArray(apps) ? String(apps.length) : '0'
})

const ecosystemCard = computed(() =>
  ecosystem.value
    ? makeEcosystemCard({
        ...ecosystem.value,
        src: safeString(ecosystem.value.image_url),
        text: ecosystemName.value || ecosystemSlug.value || ecosystemRecordId.value,
        href: '',
      })
    : null
)

const projectDump = computed(() =>
  toDebugJson({
    pending: projectPending.value,
    id: projectId.value,
    ecosystemId: ecosystemId.value,
    project: project.value,
  })
)

const ecosystemDump = computed(() =>
  toDebugJson({
    pending: ecosystemPending.value,
    ecosystem: ecosystem.value,
  })
)
</script>
