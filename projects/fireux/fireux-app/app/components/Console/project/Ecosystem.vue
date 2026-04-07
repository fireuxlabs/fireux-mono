<template>
  <section class="space-y-6">
    <p v-if="!runtime.id" class="text-sm text-dimmed">
      Select a project on `/console/projects` to inspect its live ecosystem.
    </p>

    <template v-else>
      <p v-if="resolvedError" class="text-sm text-dimmed">
        {{ resolvedError }}
      </p>

      <p v-if="!ecosystemViews.length" class="text-sm text-dimmed">
        No ecosystem context found.
      </p>

      <UCard
        v-for="view in ecosystemViews"
        :key="view.item.id"
      >
        <template #header>
          <div class="space-y-1">
            <div class="text-sm font-semibold">Ecosystem</div>
            <p class="text-sm text-dimmed">
              Surface check for the current ecosystem data.
            </p>
          </div>
        </template>

        <div class="space-y-4">
          <div class="grid gap-4 xl:grid-cols-2">
            <div
              v-for="surface in surfaces"
              :key="surface.key"
              class="space-y-2"
            >
              <div class="text-xs uppercase tracking-[0.16em] text-toned">
                {{ surface.label }}
              </div>

              <component
                :is="surface.component"
                v-bind="surfaceProps(surface.key, view)"
              />
            </div>
          </div>
        </div>
      </UCard>

      <UCard>
        <template #header>
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div class="space-y-1">
              <div class="text-sm font-semibold">Live ecosystem context</div>
              <p class="text-sm text-dimmed">
                This view reads the selected project’s live FireUX console endpoint.
              </p>
            </div>

            <div class="flex flex-wrap items-center gap-2">
              <UBadge color="neutral" variant="soft">
                {{ ecosystemViews.length }} ecosystem{{ ecosystemViews.length === 1 ? '' : 's' }}
              </UBadge>
              <UBadge color="neutral" variant="soft">
                {{ totalAppCount }} app{{ totalAppCount === 1 ? '' : 's' }}
              </UBadge>
              <UBadge v-if="databaseRows.length" color="neutral" variant="soft">
                {{ databaseRows.length }} database{{ databaseRows.length === 1 ? '' : 's' }}
              </UBadge>
              <UButton
                color="neutral"
                variant="ghost"
                icon="i-lucide-refresh-cw"
                :loading="pending"
                @click="refresh()"
              >
                Refresh
              </UButton>
            </div>
          </div>
        </template>

        <div class="space-y-3">
          <div v-if="projectSummary.id" class="grid gap-3 text-sm text-dimmed sm:grid-cols-2">
            <div>
              Firebase Project:
              <span class="font-medium text-default">{{ projectSummary.id }}</span>
            </div>
            <div v-if="projectSummary.mainEcosystemId">
              Main Ecosystem:
              <span class="font-medium text-default">{{ projectSummary.mainEcosystemId }}</span>
            </div>
            <div v-if="projectSummary.mainAppId">
              Main App:
              <span class="font-medium text-default">{{ projectSummary.mainAppId }}</span>
            </div>
          </div>

          <UButton to="/ecosystems" icon="i-lucide-orbit" variant="ghost" color="neutral">
            Open public index
          </UButton>
        </div>
      </UCard>

      <UCard v-if="databaseRows.length">
        <template #header>
          <div class="text-sm font-semibold">Databases</div>
        </template>

        <div class="flex flex-wrap gap-2">
          <UBadge
            v-for="database in databaseRows"
            :key="database.name"
            color="neutral"
            variant="soft"
          >
            {{ database.name }} · {{ database.appCount }} app{{ database.appCount === 1 ? '' : 's' }}
          </UBadge>
        </div>
      </UCard>

      <DevJson
        title="Project Ecosystem Debug"
        context="console/projects/ecosystem"
        :data="debugData"
        :default-open="true"
        :hide-when-empty="false"
      />
    </template>
  </section>
</template>

<script setup lang="ts">
type EcosystemSurfaceKey = 'pill' | 'profile' | 'preview' | 'cell'

const { ecosystem } = useProjectConsole()
const {
  runtime,
  pending,
  refresh,
  resolvedError,
  ecosystemViews,
  databaseRows,
  totalAppCount,
  projectSummary,
  debugData,
} = ecosystem

const surfaces: Array<{ key: EcosystemSurfaceKey; label: string; component: string }> = [
  { key: 'pill', label: 'Pill', component: 'EcosystemCardsPill' },
  { key: 'profile', label: 'Profile', component: 'EcosystemCardsProfile' },
  { key: 'preview', label: 'Preview', component: 'EcosystemCardsPreview' },
  { key: 'cell', label: 'Cell', component: 'EcosystemCardsCell' },
]

const surfaceProps = (
  key: EcosystemSurfaceKey,
  view: (typeof ecosystemViews.value)[number]
) => {
  if (key === 'profile' || key === 'preview') {
    return { item: view.item }
  }

  return {
    ...view.card,
    link: false,
  }
}
</script>
