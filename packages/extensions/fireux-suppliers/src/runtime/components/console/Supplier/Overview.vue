<template>
  <section class="console-surface">
    <div class="console-surface__grid console-surface__grid--2">
      <SupplierOverviewFocus :focus="focus" :group="group" />
      <SupplierOverviewGroup :group="group" :mode="focus.mode" />
    </div>

    <div class="mt-4">
      <DevFireuxDebugPanel
        title="Supplier overview"
        scope="console"
        :data="debug"
        default-open
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { useSupplierConsoleOverview } from '../../../composables/fireux/app/supplier-console/useSupplierConsoleOverview'

const { focus, group, debug } = useSupplierConsoleOverview()
</script>
