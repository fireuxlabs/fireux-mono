<template>
  <section class="overflow-hidden rounded-xl border border-default bg-elevated">
    <div class="grid gap-5 p-4 sm:p-5 lg:grid-cols-[minmax(0,1fr)_auto]">
      <div class="flex min-w-0 items-start gap-3">
        <div
          class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary text-inverted shadow-sm"
        >
          <UIcon name="i-lucide-sparkles" class="size-5" />
        </div>

        <div class="min-w-0 space-y-1">
          <div class="flex flex-wrap items-center gap-2">
            <p class="text-xs font-semibold uppercase tracking-wide text-primary">
              Misebox AI
            </p>
            <UBadge color="neutral" variant="soft" size="sm">
              Menu
            </UBadge>
          </div>
          <h2 class="text-lg font-semibold text-highlighted">
            How can I help manage your Menus today?
          </h2>
          <p class="max-w-2xl text-sm text-muted">
            Ask about the selected Kitchen's menus, dishes, prices, images or
            publishing.
          </p>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-2 lg:justify-end">
        <span class="text-xs font-medium text-muted">Context contract</span>
        <UBadge
          v-for="scope in contextScopes"
          :key="scope.label"
          color="neutral"
          variant="outline"
          size="sm"
        >
          <UIcon :name="scope.icon" class="size-3.5" />
          {{ scope.label }}
        </UBadge>
      </div>
    </div>

    <div class="border-t border-default bg-default/40 p-4 sm:p-5">
      <div class="space-y-3">
        <UChatPrompt
          v-model="draft"
          placeholder="Ask Misebox AI about your menus"
          @submit.prevent="showConnectionNotice = true"
        >
          <template #footer>
            <div class="flex items-center justify-between gap-3">
              <p class="text-xs text-muted">
                Confirmed context + current Menu records
              </p>
              <UChatPromptSubmit status="ready" label="Ask" />
            </div>
          </template>
        </UChatPrompt>

        <div class="flex flex-wrap gap-2" aria-label="Suggested Menu questions">
          <UButton
            v-for="suggestion in suggestions"
            :key="suggestion"
            color="neutral"
            variant="soft"
            size="sm"
            @click="draft = suggestion"
          >
            {{ suggestion }}
          </UButton>
        </div>

        <UAlert
          v-if="showConnectionNotice"
          color="info"
          variant="soft"
          title="Menu AI connection is next"
          description="Your draft has not been sent or saved. This design is ready for the Menu context assembler and agent endpoint."
          :close="{ color: 'info', variant: 'link' }"
          @update:open="showConnectionNotice = false"
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from '#imports'

const draft = ref('')
const showConnectionNotice = ref(false)

const contextScopes = [
  { label: 'You', icon: 'i-lucide-user' },
  { label: 'Kitchen', icon: 'i-lucide-store' },
  { label: 'Menus', icon: 'i-lucide-book-open' },
] as const

const suggestions = [
  'Summarise these menus',
  'Find missing dish information',
  'Review menu images',
  'Help me update prices',
] as const
</script>
