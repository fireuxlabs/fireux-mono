<template>
  <section
    class="space-y-4 rounded-xl border-2 border-error bg-error/10 p-4 text-highlighted shadow-sm shadow-error/10 sm:p-5"
    aria-labelledby="drinks-tool-map-title"
  >
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div class="space-y-1">
        <p class="m-0 text-xs font-semibold uppercase tracking-wide text-error">
          Temporary organising block
        </p>
        <h2 id="drinks-tool-map-title" class="m-0 text-lg font-semibold">
          Drinks capability map
        </h2>
        <p class="m-0 text-sm text-toned">
          Delete this pink section when the Drinks page contract is settled in
          its permanent locations.
        </p>
      </div>
      <UBadge color="error" variant="soft">Delete later</UBadge>
    </div>

    <div class="grid gap-3 lg:grid-cols-3">
      <article class="rounded-lg border border-error/30 bg-default/70 p-4">
        <h3 class="m-0 text-sm font-semibold">Human tools</h3>
        <ul class="mt-3 grid gap-3">
          <li v-for="tool in humanTools" :key="tool.name" class="grid gap-0.5">
            <span class="flex items-center gap-1.5 text-sm font-medium">
              <UIcon
                v-if="tool.complete"
                name="i-lucide-circle-check"
                class="size-4 text-success"
              />
              {{ tool.name }}
            </span>
            <span class="text-xs text-muted">{{ tool.placement }}</span>
          </li>
        </ul>
      </article>

      <article class="rounded-lg border border-error/30 bg-default/70 p-4">
        <h3 class="m-0 text-sm font-semibold">
          AI deductions, suggestions and compound tools
        </h3>
        <div class="mt-3 grid gap-4">
          <section class="grid gap-1" aria-labelledby="drinks-deductions-title">
            <h4 id="drinks-deductions-title" class="m-0 text-sm font-medium">
              1. AI deductions
            </h4>
            <p class="m-0 text-xs text-muted">{{ deduction }}</p>
          </section>

          <section
            class="grid gap-1"
            aria-labelledby="drinks-suggestions-title"
          >
            <h4 id="drinks-suggestions-title" class="m-0 text-sm font-medium">
              2. Suggestions
            </h4>
            <ul v-if="suggestions.length" class="grid gap-1 text-xs text-muted">
              <li v-for="suggestion in suggestions" :key="suggestion.id">
                {{ suggestion.title }}
              </li>
            </ul>
            <p v-else class="m-0 text-xs text-muted">
              No current deduction suggests an action.
            </p>
          </section>

          <section
            class="grid gap-1"
            aria-labelledby="drinks-compound-tools-title"
          >
            <h4
              id="drinks-compound-tools-title"
              class="m-0 text-sm font-medium"
            >
              3. Compound tools
            </h4>
            <dl class="grid gap-2 text-xs text-muted">
              <div class="grid gap-0.5">
                <dt class="font-medium text-toned">Local</dt>
                <dd class="m-0">
                  Complete drink details — find missing information, prepare
                  suitable additions, and ask for approval before updating any
                  drinks.
                </dd>
              </div>
              <div class="grid gap-0.5">
                <dt class="font-medium text-toned">
                  Global · Inventory + Drinks
                </dt>
                <dd class="m-0">
                  Stocktake drinks — use the Inventory stock-take capability
                  with the drinks in this Kitchen.
                </dd>
              </div>
            </dl>
          </section>
        </div>
      </article>

      <article class="rounded-lg border border-error/30 bg-default/70 p-4">
        <h3 class="m-0 text-sm font-semibold">Content</h3>
        <ul class="mt-3 grid gap-3">
          <li v-for="item in content" :key="item.name" class="grid gap-0.5">
            <span class="flex items-center gap-1.5 text-sm font-medium">
              <UIcon
                v-if="item.complete"
                name="i-lucide-circle-check"
                class="size-4 text-success"
              />
              {{ item.name }}
            </span>
            <span class="text-xs text-muted">{{ item.placement }}</span>
          </li>
        </ul>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { KitchenOperationSuggestion } from '../../../../models/operation-suggestions'

const props = defineProps<{ suggestions: KitchenOperationSuggestion[] }>()
const deduction = computed(() => {
  const count = props.suggestions.reduce(
    (total, suggestion) => total + (suggestion.affectedCount || 0),
    0
  )
  if (!count) return 'Every current drink has an image.'
  return `${count} current ${count === 1 ? 'drink is' : 'drinks are'} missing an image.`
})

const humanTools = [
  { name: 'Create drink', placement: 'Collection toolbar', complete: true },
  {
    name: 'Read drink',
    placement: 'Collection and drink details',
    complete: true,
  },
  { name: 'Update drink', placement: 'Drink details', complete: false },
  { name: 'Delete drink', placement: 'Drink details', complete: false },
] as const

const content = [
  { name: 'Drink card grid', placement: 'Collection page', complete: true },
  { name: 'Drink details', placement: 'Detail page', complete: true },
  {
    name: 'Guiding literature',
    placement: 'Below the collection',
    complete: true,
  },
] as const
</script>
