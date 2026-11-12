<template>
  <UPage class="research-page">
    <UPageHeader
      :title="`${demand?.reconciliation?.workspace ?? 'Workspace'} capability plan`"
      description="What to build, what already exists, and what needs proving."
    />
    <UPageBody class="research-page__body">
      <div class="research-page__stages">
        <AppSearchDemandBriefNav :briefs="briefs" />
        <AppSearchDemandStageNav current="capabilities" />
      </div>
      <UAlert
        v-if="pending"
        title="Loading capability plan"
        color="neutral"
        variant="soft"
        role="status"
        aria-live="polite"
        aria-busy="true"
      />
      <UAlert
        v-else-if="error || !demand"
        title="Capability plan unavailable"
        description="Research could not be loaded for this subject."
        :color="error ? 'error' : 'neutral'"
        variant="soft"
        :role="error ? 'alert' : 'status'"
        :aria-live="error ? 'assertive' : 'polite'"
      >
        <template #actions>
          <FireCopyError
            v-if="error"
            message="Capability plan unavailable&#10;Research could not be loaded for this subject."
          />
        </template>
      </UAlert>
      <AppSearchDemandCapabilitiesReview v-else :demand="demand" />
    </UPageBody>
  </UPage>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { useAsyncData } from '#imports'
import { useAppResearchScope } from '../../app/composables/search-demand/useAppResearchScope'
import type { AppSearchDemand } from '../../app/models/search-demand'
type SearchDemandResponse = { ok: true; demand: AppSearchDemand | null }
const { data, pending, error } = await useAsyncData(
  'search-demand-capabilities',
  () => $fetch<SearchDemandResponse>('/api/app/search-demand')
)
const { demand, briefs } = useAppResearchScope(
  computed(() => data.value?.demand ?? null)
)
definePageMeta({
  layout: 'default',
  title: 'Capability plan',
  description:
    'Read capability priorities, current implementation and the next delivery journey.',
})
</script>
<style scoped src="../../app/assets/styles/search-demand-reading.css"></style>
