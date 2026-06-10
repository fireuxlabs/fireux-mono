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
      <ConsoleBlankTargetsSelected :selected-id="selectedId.value" />

      <ConsoleBlankTargetsLive
        :collection="blank.liveTargets.value"
        :pending="blank.pending.value"
        @select="selectBlank"
      />

      <ConsoleBlankTargetsDemo />
      <ConsoleBlankTargetsTest />

      <DevJson
        v-if="import.meta.dev"
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

const { blank, selectedId, debug, actions } = useBlankConsoleIndex()

const selectBlank = (id: string) => {
  actions.selectLive(id)
}
</script>
