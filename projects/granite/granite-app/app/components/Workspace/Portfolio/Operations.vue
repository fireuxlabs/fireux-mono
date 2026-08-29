<template>
  <section
    aria-labelledby="portfolio-workspace-operations"
    class="grid gap-5 border-t border-default pt-6"
  >
    <div class="flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
      <div class="grid max-w-2xl gap-1">
        <h2
          id="portfolio-workspace-operations"
          class="m-0 text-2xl font-semibold text-highlighted"
        >
          What you can do
        </h2>
        <p class="m-0 text-sm leading-6 text-muted">
          Work with properties, compliance, documents, tasks and financial
          signals for the selected Portfolio.
        </p>
      </div>
      <UButton
        to="/operations"
        label="All Portfolio operations"
        color="neutral"
        variant="link"
        trailing-icon="i-lucide-arrow-right"
      />
    </div>

    <div class="grid gap-x-8 sm:grid-cols-2 xl:grid-cols-4">
      <NuxtLink
        v-for="operation in portfolioOperations"
        :key="operation.to"
        :to="operation.to"
        class="group grid grid-cols-[auto_minmax(0,1fr)_auto] gap-3 border-b border-default py-4"
      >
        <UIcon :name="operation.icon" class="mt-0.5 size-5 text-primary" />
        <span class="min-w-0">
          <strong class="block text-sm font-semibold text-highlighted">
            {{ operation.title }}
          </strong>
          <span class="mt-1 block text-sm leading-5 text-muted">
            {{ operation.description }}
          </span>
        </span>
        <UIcon
          name="i-lucide-arrow-up-right"
          class="mt-0.5 size-4 text-dimmed transition group-hover:text-primary"
        />
      </NuxtLink>
    </div>
  </section>
</template>

<script setup lang="ts">
import { portfolioOperations } from 'fireux-properties/runtime/portfolio/models/operations'
</script>
