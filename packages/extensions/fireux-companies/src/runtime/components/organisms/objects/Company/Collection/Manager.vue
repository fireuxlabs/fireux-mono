<template>
  <UCard :ui="{ body: 'space-y-4' }">
    <template #header>
      <div class="flex items-center justify-between">
        <div class="font-medium">Companies</div>
        <div class="text-sm text-dimmed">{{ total }}</div>
      </div>
    </template>

    <div v-if="!cells.length" class="text-sm text-dimmed">
      No companies yet.
    </div>

    <div v-else class="grid gap-3 md:grid-cols-2">
      <OrganismsObjectsCompanyCardsCell
        v-for="cell in cells"
        :key="cell.id"
        :card="cell"
        :avatar="cell.avatar ?? null"
      />
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useCompanyFetch } from '../../../../../composables/fireux/firestore/objects/company/fetch/useCompanyFetch'
import { useCompanyInterface } from '../../../../../composables/fireux/firestore/objects/company/utils/view/useCompanyInterface'

const { companies } = useCompanyFetch()
const { cellProps } = useCompanyInterface()

const cells = computed(() => (companies.value ?? []).map((c) => cellProps(c)))
const total = computed(() => cells.value.length)
</script>
