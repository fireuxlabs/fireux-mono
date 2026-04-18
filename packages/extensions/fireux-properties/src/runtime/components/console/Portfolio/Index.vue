<template>
  <section class="space-y-6">
    <UAlert
      v-if="!livePortfolios.length"
      color="neutral"
      variant="soft"
      title="No live portfolios found"
      description="No live portfolios are currently available in this workspace."
    />

    <div class="space-y-6">
      <div class="space-y-2">
        <div class="flex items-center justify-between gap-3">
          <div class="text-xs uppercase tracking-[0.16em] text-toned">
            {{ selectedPortfolio ? 'Selected Portfolio' : 'Select a portfolio' }}
          </div>

          <UButton
            v-if="selectedPortfolio"
            color="neutral"
            variant="ghost"
            size="sm"
            icon="i-lucide-x"
            @click="clearSelectedPortfolio"
          >
            Clear
          </UButton>
        </div>

        <PortfolioCardsPill
          v-if="selectedPortfolioCard"
          v-bind="selectedPortfolioCard"
          :link="false"
          :show-badges="false"
        />

        <p v-else class="text-sm text-dimmed">
          Choose a live, demo, or test portfolio to load it into the console.
        </p>
      </div>

      <PortfolioCollectionManager
        v-if="livePortfolios.length"
        :collection="livePortfolios"
        title="Choose Live Portfolio"
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

        <div class="space-y-2">
          <PortfolioCardsPill
            v-for="scenario in demoPortfolioCards"
            :key="scenario.id"
            v-bind="scenario"
            :link="false"
            :action="true"
            :show-badges="false"
            @action="selectDemoPortfolio(scenario.id)"
          />
        </div>
      </div>
    </section>

    <section v-if="testPortfolio" class="w-full max-w-xl space-y-3">
      <div class="flex items-center gap-3">
        <div class="h-px flex-1 bg-default/60" />
        <div class="text-xs uppercase tracking-[0.16em] text-toned">Or</div>
        <div class="h-px flex-1 bg-default/60" />
      </div>

      <div class="space-y-2">
        <div class="text-sm font-medium text-highlighted">Use your test portfolio</div>

        <div class="text-sm text-dimmed">
          Personal sandbox portfolio for experiments and console setup.
        </div>

        <PortfolioCardsPill
          v-if="testPortfolioCard"
          v-bind="testPortfolioCard"
          :link="false"
          :action="true"
          :show-badges="false"
          @action="selectTestPortfolio"
        />
      </div>
    </section>
  </section>
</template>

<script setup lang="ts">
import { usePortfolioConsoleIndex } from '../../../composables/fireux/app/portfolio-console/usePortfolioConsoleIndex'

const {
  selectedPortfolio,
  clearSelectedPortfolio,
  showSimulations,
  livePortfolios,
  demoPortfolios,
  testPortfolio,
  selectedPortfolioCard,
  demoPortfolioCards,
  testPortfolioCard,
  selectPortfolio,
  selectDemoPortfolio,
  selectTestPortfolio,
} = usePortfolioConsoleIndex()
</script>
