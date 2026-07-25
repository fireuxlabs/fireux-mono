<template>
  <div class="market-sell-start">
    <p class="market-eyebrow">{{ copy('sell_eyebrow') }}</p>
    <h1 :id="id">{{ copy('sell') }}</h1>
    <p class="market-intro">{{ copy('sell_intro') }}</p>

    <ul class="market-sell-points">
      <li>
        <UIcon name="i-lucide-gift" aria-hidden="true" />
        <span>{{ copy('sell_free') }}</span>
      </li>
      <li>
        <UIcon name="i-lucide-handshake" aria-hidden="true" />
        <span>{{ copy('sell_direct') }}</span>
      </li>
      <li>
        <UIcon name="i-lucide-map-pin" aria-hidden="true" />
        <span>{{ copy('sell_local') }}</span>
      </li>
    </ul>

    <ClientOnly>
      <NuxtLink
        :to="isSignedIn ? '/mis' : '/auth'"
        class="market-action market-action--light market-sell-start__action"
      >
        <UIcon
          :name="
            isSignedIn
              ? 'i-lucide-layout-dashboard'
              : 'i-lucide-user-round-plus'
          "
          aria-hidden="true"
        />
        <strong>
          {{
            copy(
              isSignedIn
                ? 'sell_open_account'
                : 'sell_register'
            )
          }}
        </strong>
        <UIcon name="i-lucide-arrow-right" aria-hidden="true" />
      </NuxtLink>

      <template #fallback>
        <USkeleton class="market-sell-start__skeleton" />
      </template>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { useInterlakenCopy } from '@/composables/useInterlakenCopy'
import { useConsoleEntryState } from 'fireux-core/runtime/composables/fireux/app/ui/useConsoleEntryState'

defineProps<{
  id?: string
}>()

const { isSignedIn } = useConsoleEntryState()
const { copy } = useInterlakenCopy()
</script>
