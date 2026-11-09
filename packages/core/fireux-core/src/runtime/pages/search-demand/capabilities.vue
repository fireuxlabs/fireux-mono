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
      <FireStateCard
        v-if="pending"
        surface="collection"
        title="Loading capability plan"
        loading
      />
      <FireStateCard
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
