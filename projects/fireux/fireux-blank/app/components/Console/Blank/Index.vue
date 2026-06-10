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
      <ConsoleTargetIndex
        entity-label="Blank"
        :cards="blank.cards.value"
        :pending="blank.pending.value"
        create-to="/console/blank/create"
        create-label="Create Blank"
        empty-description="Create the first Blank target to test the root console lifecycle."
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

const { blank, debug } = useBlankConsoleIndex()
const isDev = import.meta.dev
</script>
