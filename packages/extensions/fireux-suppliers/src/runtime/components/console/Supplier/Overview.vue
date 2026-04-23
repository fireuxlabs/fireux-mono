<template>
  <section class="console-surface">
    <div class="console-surface__grid console-surface__grid--2">
      <SupplierOverviewFocus :focus="focus" :group="group" />
      <SupplierOverviewGroup :group="group" :mode="focus.mode" />
    </div>
  </section>
</template>

<script setup lang="ts">
import { useSupplierConsoleOverview } from '../../../composables/fireux/app/supplier-console/useSupplierConsoleOverview'

const { focus, group } = useSupplierConsoleOverview()
</script>
