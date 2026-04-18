<template>
  <section class="space-y-6">
    <UAlert
      v-if="!kitchens.live.length"
      color="neutral"
      variant="soft"
      title="No live kitchens found"
      description="No live kitchens are currently available in this workspace."
    />

    <div class="space-y-6">
      <div class="space-y-2">
        <div class="flex items-center justify-between gap-3">
          <div class="text-xs uppercase tracking-[0.16em] text-toned">
            {{ selectedKitchen ? 'Selected Kitchen' : 'Select a kitchen' }}
          </div>

          <UButton
            v-if="selectedKitchen"
            color="neutral"
            variant="ghost"
            size="sm"
            icon="i-lucide-x"
            @click="clearSelectedKitchen"
          >
            Clear
          </UButton>
        </div>

        <KitchenCardsPill
          v-if="selectedKitchenCard"
          v-bind="selectedKitchenCard"
          :link="false"
          :show-badges="false"
        />

        <p v-else class="text-sm text-dimmed">
          Choose a live, demo, or test kitchen to load it into the console.
        </p>
      </div>

      <KitchenCollectionManager
        v-if="kitchens.live.length"
        :collection="kitchens.live"
        title="Choose Live Kitchen"
        description="Select the live kitchen you want to work on."
        :link="false"
        :action="true"
        :show-badges="false"
        @select="actions.selectLive"
      />
    </div>

    <section v-if="kitchens.demo.length" class="w-full max-w-xl space-y-3">
      <div class="flex items-center gap-3">
        <div class="h-px flex-1 bg-default/60" />
        <div class="text-xs uppercase tracking-[0.16em] text-toned">Or</div>
        <div class="h-px flex-1 bg-default/60" />
      </div>

      <div class="space-y-2">
        <div class="text-sm font-medium text-highlighted">Try a kitchen simulation</div>

        <USwitch
          v-model="state.showSimulations"
          unchecked-icon="i-lucide-x"
          checked-icon="i-lucide-check"
          label="Show kitchen simulations"
        />
      </div>

      <div v-if="state.showSimulations" class="space-y-2">
        <div class="text-sm text-dimmed">
          Read-only demo kitchens wired into the same console stack.
        </div>

        <div class="space-y-2">
          <KitchenCardsPill
            v-for="scenario in demoKitchenCards"
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

    <section v-if="kitchens.test" class="w-full max-w-xl space-y-3">
      <div class="flex items-center gap-3">
        <div class="h-px flex-1 bg-default/60" />
        <div class="text-xs uppercase tracking-[0.16em] text-toned">Or</div>
        <div class="h-px flex-1 bg-default/60" />
      </div>

      <div class="space-y-2">
        <div class="text-sm font-medium text-highlighted">Use your test kitchen</div>

        <div class="text-sm text-dimmed">
          Personal sandbox kitchen for experiments and console setup.
        </div>

        <KitchenCardsPill
          v-if="testKitchenCard"
          v-bind="testKitchenCard"
          :link="false"
          :action="true"
          :show-badges="false"
          @action="actions.selectTest"
        />
      </div>
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useKitchenInterface } from '../../../composables/fireux/firestore/kitchen/utils/view/useKitchenInterface'
import { useKitchenConsole } from '../../../composables/fireux/app/kitchen-console/useKitchenConsole'
import { useKitchenConsoleIndex } from '../../../composables/fireux/app/kitchen-console/useKitchenConsoleIndex'

type DemoKitchenListItem = {
  id: string
  name: string
  label?: string
  image_url?: string
}

type KitchenSurface = {
  id?: string
  name?: string
  short_name?: string
  short_address?: string
  formatted_address?: string
  image_url?: string
  slug?: string
  is_test_kitchen?: boolean
  place_id?: string
}

type KitchenPillCard = NonNullable<
  ReturnType<ReturnType<typeof useKitchenInterface>['pill']>
>

type KitchenPillInput = Parameters<ReturnType<typeof useKitchenInterface>['pill']>[0]

const { state, kitchens, actions } = useKitchenConsoleIndex()
const { selectedKitchen, selectedMode, clearSelectedKitchen } = useKitchenConsole()
const { pill } = useKitchenInterface()

const toDemoKitchenSurface = (kitchen: DemoKitchenListItem): KitchenSurface => ({
  id: kitchen.id,
  name: kitchen.name,
  short_address: kitchen.label,
  image_url: kitchen.image_url,
})

const demoKitchenCards = computed<KitchenPillCard[]>(() =>
  kitchens.value.demo
    .map((kitchen: DemoKitchenListItem) =>
      pill(toDemoKitchenSurface(kitchen) as KitchenPillInput)
    )
    .filter((card): card is KitchenPillCard => Boolean(card))
)

const selectedKitchenCard = computed<KitchenPillCard | null>(() => {
  const kitchen = selectedKitchen.value as KitchenSurface | DemoKitchenListItem | null
  if (!kitchen) return null

  if (selectedMode.value === 'demo') {
    return pill(toDemoKitchenSurface(kitchen as DemoKitchenListItem) as KitchenPillInput) ?? null
  }

  return pill(kitchen as KitchenPillInput) ?? null
})

const testKitchenCard = computed<KitchenPillCard | null>(() => {
  const kitchen = kitchens.value.test
  if (!kitchen) return null

  return pill(kitchen as KitchenPillInput) ?? null
})
</script>
