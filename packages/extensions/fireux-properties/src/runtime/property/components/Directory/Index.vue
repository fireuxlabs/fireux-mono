<template>
  <MoleculesStateCard
    v-if="outcome === 'pending'"
    state="loading"
    entity="properties"
    surface="collection"
  />
  <MoleculesStateCard
    v-else-if="outcome === 'error'"
    state="error"
    title="Properties could not be loaded"
    description="Try again to see the latest published properties."
    surface="collection"
  >
    <template #actions
      ><UButton label="Try again" variant="soft" @click="refresh()"
    /></template>
  </MoleculesStateCard>
  <template v-else>
    <PropertyCollection v-if="properties.length" :properties="properties" />
    <MoleculesStateCard
      v-else
      state="empty"
      title="No published properties here yet"
      :description="
        hasMore
          ? 'More results are available to check.'
          : 'Published properties will appear here.'
      "
      surface="collection"
    />
    <div v-if="hasMore" class="mt-6 flex justify-center">
      <UButton
        label="Show more properties"
        :loading="loadingMore"
        :disabled="loadingMore"
        variant="soft"
        @click="loadMore()"
      />
    </div>
    <MoleculesStateCard
      v-if="loadMoreError"
      state="error"
      title="More properties could not be loaded"
      description="Try again to continue browsing."
      surface="bare"
    />
  </template>
</template>
<script setup lang="ts">
import { usePropertyDirectory } from '../../composables/usePropertyDirectory'
const {
  properties,
  outcome,
  refresh,
  hasMore,
  loadingMore,
  loadMore,
  loadMoreError,
} = usePropertyDirectory()
</script>
