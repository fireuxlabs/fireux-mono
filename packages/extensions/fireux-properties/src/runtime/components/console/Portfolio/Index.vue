<!-- ConsolePortfolio.vue -->
<template>
  <section class="space-y-6">
    <UAlert
      v-if="!livePortfolios.length"
      color="neutral"
      variant="soft"
      title="No live portfolios found"
      description="No live portfolios are currently available in this workspace."
    />

    <div v-if="livePortfolios.length" class="space-y-6">
      <div class="space-y-2">
        <div class="flex items-center justify-between gap-3">
          <div class="text-xs uppercase tracking-[0.16em] text-toned">
            {{ portfolio ? 'Selected Portfolio' : 'Select a portfolio' }}
          </div>

          <UButton
            v-if="portfolio"
            color="neutral"
            variant="ghost"
            size="sm"
            icon="i-lucide-x"
            @click="clearSelection"
          >
            Clear
          </UButton>
        </div>

        <PortfolioCardsPill
          v-if="portfolio"
          v-bind="portfolio"
          :link="false"
          :show-badges="false"
        />

        <p v-else class="text-sm text-dimmed">
          Choose a portfolio below to load it into the console.
        </p>
      </div>

      <PortfolioCollectionManager
        :collection="livePortfolios"
        title="Choose Portfolio"
        description="Select the live portfolio you want to work on."
        :link="false"
        :action="true"
        :show-badges="false"
        @select="selectPortfolio"
      />
    </div>

    <section v-if="demoPortfolios.length" class="w-full max-w-xl space-y-3">
      <div class="flex items-center gap-3">
        <div class="h-px flex-1 bg-default/60" />
        <div class="text-xs uppercase tracking-[0.16em] text-toned">Or</div>
        <div class="h-px flex-1 bg-default/60" />
      </div>

      <div class="space-y-2">
        <div class="text-sm font-medium text-highlighted">Try a portfolio simulation</div>

        <USwitch
          v-model="showSimulations"
          unchecked-icon="i-lucide-x"
          checked-icon="i-lucide-check"
          label="Show portfolio simulations"
        />
      </div>

      <div v-if="showSimulations" class="space-y-2">
        <div class="text-sm text-dimmed">
          Read-only demo portfolios wired into the same console stack.
        </div>

        <div class="grid gap-2 sm:grid-cols-2">
          <UButton
            v-for="scenario in demoPortfolios"
            :key="scenario.id"
            color="neutral"
            variant="soft"
            class="justify-between"
            @click="selectDemoPortfolio(scenario.id)"
          >
            <span>{{ scenario.name }}</span>
            <span class="text-xs text-dimmed">{{ scenario.label }}</span>
          </UButton>
        </div>
      </div>
    </section>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { usePortfolioConsoleIndex } from '../../../composables/fireux/app/portfolio-console/usePortfolioConsoleIndex'

const {
  portfolio,
  livePortfolios,
  demoPortfolios,
  clearSelection,
  selectPortfolio,
  selectDemoPortfolio,
} = usePortfolioConsoleIndex({ publishHeader: true })

const showSimulations = ref(false)
</script>