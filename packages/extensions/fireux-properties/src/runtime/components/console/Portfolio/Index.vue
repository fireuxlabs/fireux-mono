<template>
  <section class="space-y-6">
    <UAlert
      v-if="!portfolios.live.length"
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

      <div v-if="isDev">
        <DevFireuxDebugPanel
          title="Portfolio index"
          scope="console"
          :data="debug"
        />
      </div>

      <PortfolioCollectionManager
        v-if="portfolios.live.length"
        :collection="portfolios.live"
        title="Choose Live Portfolio"
        description="Select the live portfolio you want to work on."
        :link="false"
        :action="true"
        :show-badges="false"
        @select="actions.selectLive"
      />
    </div>

    <section v-if="portfolios.demo.length" class="w-full max-w-xl space-y-3">
      <div class="flex items-center gap-3">
        <div class="h-px flex-1 bg-default/60" />
        <div class="text-xs uppercase tracking-[0.16em] text-toned">Or</div>
        <div class="h-px flex-1 bg-default/60" />
      </div>

      <div class="space-y-2">
        <div class="text-sm font-medium text-highlighted">Try a portfolio simulation</div>

        <USwitch
          v-model="state.showSimulations"
          unchecked-icon="i-lucide-x"
          checked-icon="i-lucide-check"
          label="Show portfolio simulations"
        />
      </div>

      <div v-if="state.showSimulations" class="space-y-2">
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
            @action="actions.selectDemo(scenario.id)"
          />
        </div>
      </div>
    </section>

    <section v-if="portfolios.test || actions.createTest" class="w-full max-w-xl space-y-3">
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
          @action="actions.selectTest"
        />

        <UButton
          v-else-if="actions.createTest"
          color="neutral"
          variant="soft"
          icon="i-lucide-plus"
          :loading="state.creatingTest"
          @click="actions.createTest"
        >
          Create Test Portfolio
        </UButton>
      </div>
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { usePortfolioInterface } from '../../../composables/fireux/firestore/portfolio/utils/view/usePortfolioInterface'
import { usePortfolioConsoleIndex } from '../../../composables/fireux/app/portfolio-console/usePortfolioConsoleIndex'

const {
  state,
  portfolios,
  actions,
  selectedPortfolio,
  debug,
  clearSelectedPortfolio,
} = usePortfolioConsoleIndex()
const { pill } = usePortfolioInterface()
const isDev = import.meta.dev

type PortfolioPillCard = NonNullable<
  ReturnType<ReturnType<typeof usePortfolioInterface>['pill']>
>

const demoPortfolioCards = computed<PortfolioPillCard[]>(() =>
  portfolios.value.demo
    .map((portfolio) => pill(portfolio))
    .filter((card): card is PortfolioPillCard => Boolean(card))
)

const selectedPortfolioCard = computed<PortfolioPillCard | null>(() => {
  const portfolio = selectedPortfolio.value
  if (!portfolio) return null

  return pill(portfolio) ?? null
})

const testPortfolioCard = computed<PortfolioPillCard | null>(() => {
  const portfolio = portfolios.value.test
  if (!portfolio) return null

  return pill(portfolio) ?? null
})
</script>
