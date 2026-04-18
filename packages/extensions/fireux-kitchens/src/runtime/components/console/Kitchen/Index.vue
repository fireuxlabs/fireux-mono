<template>
  <section class="space-y-6">
    <UAlert
      v-if="!liveKitchens.length"
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
        v-if="liveKitchens.length"
        :collection="liveKitchens"
        title="Choose Live Kitchen"
        description="Select the live kitchen you want to work on."
        :link="false"
        :action="true"
        :show-badges="false"
        @select="selectKitchen"
      />
    </div>

    <section v-if="demoKitchens.length" class="w-full max-w-xl space-y-3">
      <div class="flex items-center gap-3">
        <div class="h-px flex-1 bg-default/60" />
        <div class="text-xs uppercase tracking-[0.16em] text-toned">Or</div>
        <div class="h-px flex-1 bg-default/60" />
      </div>

      <div class="space-y-2">
        <div class="text-sm font-medium text-highlighted">Try a kitchen simulation</div>

        <USwitch
          v-model="showSimulations"
          unchecked-icon="i-lucide-x"
          checked-icon="i-lucide-check"
          label="Show kitchen simulations"
        />
      </div>

      <div v-if="showSimulations" class="space-y-2">
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
            @action="selectDemoKitchen(scenario.id)"
          />
        </div>
      </div>
    </section>

    <section v-if="testKitchen" class="w-full max-w-xl space-y-3">
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
          @action="selectTestKitchen"
        />
      </div>
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useConsoleIndex } from 'fireux-core/runtime/composables/fireux/console/useConsoleIndex'
import { useKitchenCollection } from '../../../composables/fireux/firestore/kitchen/fetch/useKitchenCollection'
import { useKitchenFetch } from '../../../composables/fireux/firestore/kitchen/fetch/useKitchenFetch'
import { useKitchenInterface } from '../../../composables/fireux/firestore/kitchen/utils/view/useKitchenInterface'

const {
  selectedKitchen,
  selectedMode,
  selectKitchen,
  clearSelectedKitchen,
} = useKitchenConsole()
const { kitchens: liveKitchenSource } = useKitchenCollection()
const { uid } = useAuth()
const { kitchen: testKitchenSource } = useKitchenFetch(uid, {
  collectionPath: 'test-kitchens',
})
const { pill } = useKitchenInterface()

type DemoKitchenListItem = {
  id: string
  name: string
  label?: string
  image_url?: string
}

const normalizeString = (value: unknown) => String(value ?? '').trim()

const kitchens = computed(() => ({
  live: liveKitchenSource.value,
  demo: [] as DemoKitchenListItem[],
  test: testKitchenSource.value,
}))

const {
  showSimulations,
  liveItems: liveKitchens,
  demoItems: demoKitchens,
  testItem: testKitchen,
  demoCards: demoKitchenCards,
  selectedCard: selectedKitchenCard,
  testCard: testKitchenCard,
  selectDemoEntity: selectDemoKitchen,
  selectTestEntity: selectTestKitchen,
} = useConsoleIndex({
  entities: kitchens,
  selectedEntity: selectedKitchen,
  selectedMode,
  selectEntity: selectKitchen,
  toDemoCard: (kitchen: DemoKitchenListItem) =>
    pill({
      id: kitchen.id,
      name: kitchen.name,
      short_address: kitchen.label,
      image_url: kitchen.image_url,
    } as never),
  toSelectedCard: (kitchen, mode, user) => {
    if (mode === 'demo') {
      return pill({
        id: (kitchen as Record<string, unknown>).id,
        name: (kitchen as Record<string, unknown>).name,
        short_address: (kitchen as Record<string, unknown>).label,
        image_url: (kitchen as Record<string, unknown>).image_url,
      } as never)
    }

    if (mode === 'test') {
      const card = pill({
        ...(kitchen as Record<string, unknown>),
        image_url:
          normalizeString((kitchen as Record<string, unknown>).image_url) || user.avatarSrc,
      } as never)

      if (!card) return null

      return {
        ...card,
        title: 'Test Kitchen',
        subtitle: user.displayName,
      }
    }

    return pill(kitchen as never)
  },
  toTestCard: (kitchen, user) => {
    const card = pill({
      ...(kitchen as Record<string, unknown>),
      image_url:
        normalizeString((kitchen as Record<string, unknown>).image_url) || user.avatarSrc,
    } as never)
    if (!card) return null

    return {
      ...card,
      title: 'Test Kitchen',
      subtitle: user.displayName,
    }
  },
  getTestId: (kitchen) =>
    normalizeString((kitchen as Record<string, unknown>).id),
})
</script>
