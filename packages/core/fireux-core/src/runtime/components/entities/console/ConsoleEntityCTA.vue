<template>
  <UPageCTA :title="title" orientation="horizontal">
    <template #top>
      <div
        v-if="consoleEntryClose"
        class="pointer-events-none absolute inset-x-0 top-0 z-10 flex justify-end p-3 sm:p-4"
      >
        <UButton
          :to="consoleEntryClose.to"
          icon="i-lucide-x-circle"
          color="neutral"
          variant="ghost"
          :aria-label="consoleEntryClose.ariaLabel"
          class="pointer-events-auto"
        />
      </div>
    </template>

    <template #header>
      <div class="space-y-4">
        <h2 class="text-pretty text-3xl font-semibold tracking-tight text-highlighted sm:text-4xl lg:text-5xl">
          {{ title }}
        </h2>
      </div>
    </template>

    <template #links>
      <div class="space-y-4">
        <section v-if="showMy" class="space-y-2">
          <p class="text-sm font-semibold">{{ myLabel }}</p>
          <slot name="my" />
        </section>

        <section v-if="showTest" class="space-y-2">
          <p class="text-sm font-semibold">{{ testLabel }}</p>
          <slot name="test" />
        </section>

        <section v-if="showReadOnly" class="space-y-2">
          <p class="text-sm font-semibold">{{ readOnlyLabel }}</p>
          <slot name="readOnly" />
        </section>

        <section class="space-y-2">
          <UButton
            block
            variant="subtle"
            color="primary"
            icon="i-lucide-book-open"
            :to="learnMoreTo"
          >
            Learn more
          </UButton>
        </section>
      </div>
    </template>

    <template #default>
      <slot />
    </template>
  </UPageCTA>
</template>

<script setup lang="ts">
import { inject } from 'vue'

type ConsoleEntryClose = {
  to: string
  ariaLabel: string
}

const consoleEntryClose = inject<ConsoleEntryClose | null>(
  'fireux-console-entry-close',
  null
)

withDefaults(defineProps<{
  title: string
  myLabel: string
  testLabel: string
  readOnlyLabel: string
  learnMoreTo: string
  showMy?: boolean
  showTest?: boolean
  showReadOnly?: boolean
}>(), {
  showMy: true,
  showTest: true,
  showReadOnly: true,
})
</script>
