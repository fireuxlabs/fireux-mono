<template>
  <UCard
    as="section"
    aria-label="Interactive Kitchen Console preview"
    class="overflow-hidden"
    :ui="{ body: 'p-0 sm:p-0' }"
  >
    <div
      class="grid min-h-[32rem] grid-cols-[4.5rem_minmax(0,1fr)] sm:grid-cols-[12rem_minmax(0,1fr)]"
    >
      <aside class="border-r border-default bg-elevated/70 p-3">
        <div class="flex items-center gap-2 px-1 py-2">
          <UIcon
            name="i-lucide-chef-hat"
            class="size-5 shrink-0 text-primary"
          />
          <span class="hidden text-sm font-semibold text-highlighted sm:block">
            Kitchen
          </span>
        </div>

        <nav class="mt-3 grid gap-1" aria-label="Kitchen Operations">
          <button
            v-for="operation in operations"
            :key="operation.id"
            type="button"
            class="flex min-h-9 w-full items-center gap-2 rounded-lg px-2 text-left text-sm text-toned transition-colors hover:bg-elevated focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            :class="operation.id === selectedOperationId
              ? 'bg-primary/10 text-primary'
              : ''"
            :aria-label="operation.title"
            :aria-current="operation.id === selectedOperationId
              ? 'page'
              : undefined"
            :title="operation.title"
            @click="selectedOperationId = operation.id"
          >
            <UIcon :name="operation.icon" class="size-4 shrink-0" />
            <span class="hidden truncate sm:block">{{ operation.title }}</span>
          </button>
        </nav>
      </aside>

      <div
        v-if="selectedOperation"
        class="min-w-0 bg-default p-4 sm:p-5"
      >
        <header
          class="flex items-center justify-between gap-3 border-b border-default pb-4"
        >
          <div class="min-w-0">
            <p class="text-xs font-medium text-dimmed">
              Kitchen Console
            </p>
            <p class="truncate font-semibold text-highlighted">
              {{ selectedOperation.title }}
            </p>
          </div>
          <UBadge color="neutral" variant="soft" size="sm">
            Preview
          </UBadge>
        </header>

        <div
          :key="selectedOperation.id"
          class="mt-5 min-h-[20rem] rounded-xl border border-dashed border-default bg-elevated/20"
          :aria-label="`${selectedOperation.title} page canvas`"
        />
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { kitchenOperations } from 'fireux-kitchens/runtime/content/operations'

const operations = kitchenOperations
const selectedOperationId = ref('kitchen.menus')
const selectedOperation = computed(() =>
  operations.find(operation => operation.id === selectedOperationId.value)
  || operations[0]
)
</script>
