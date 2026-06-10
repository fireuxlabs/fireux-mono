<template>
  <UPage>
    <UPageHeader
      class="pageheader"
      title="Blank Console"
      description="A clean console family for shaping the shared console base."
    >
      <template #links>
        <UButton
          to="/console/blank/create"
          icon="i-lucide-plus"
          color="primary"
        >
          Create Blank
        </UButton>
      </template>
    </UPageHeader>

    <UPageBody class="pagebody">
      <BlankCollectionManager
        :collection="blank.liveTargets.value"
        :pending="blank.pending.value"
        title="Choose Blank"
        description="Select the Blank target you want to work on."
        :action="true"
        :show-badges="false"
        @select="selectBlank"
      />

      <DevJson
        v-if="isDev"
        title="Blank console debug"
        context="fireux-blank · /console/blank"
        :data="debug"
        :default-open="false"
      />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useBlankConsoleIndex } from '../../../composables/fireux/console/blank/useBlankConsoleIndex'

const { blank, debug, actions } = useBlankConsoleIndex()
const isDev = import.meta.dev

const selectBlank = (id: string) => {
  actions.selectLive(id)
}
</script>
