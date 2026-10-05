<template>
  <UPage class="research-page">
    <UPageHeader
      :ui="{
        root: 'py-5',
        title: 'text-2xl sm:text-3xl',
        description: 'text-sm mt-2',
      }"
      :title="`${demand?.reconciliation?.workspace ?? 'Workspace'} capability plan`"
      description="What to build, what already exists, and what needs proving."
    />
    <UPageBody class="mt-5 flex flex-col gap-5 space-y-0">
      <div class="grid gap-3">
        <AppSearchDemandBriefNav :briefs="briefs" />
        <AppSearchDemandStageNav current="capabilities" />
      </div>
      <MoleculesStateCard
        v-if="pending"
        surface="collection"
        title="Loading capability plan"
        loading
      />
      <MoleculesStateCard
        v-else-if="error || !demand"
        surface="collection"
        :state="error ? 'error' : 'empty'"
        title="Capability plan unavailable"
        description="Research could not be loaded for this subject."
      />
      <AppSearchDemandCapabilitiesReview v-else :demand="demand" />
    </UPageBody>
  </UPage>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { useAsyncData } from '#imports'
import { useAppResearchScope } from '../../app/composables/search-demand/useAppResearchScope'
import type { AppSearchDemand } from '../../../config/app/search-demand'
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
<style scoped src="../../app/components/SearchDemand/reading.css"></style>
