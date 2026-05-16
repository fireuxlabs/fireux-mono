<template>
  <section class="space-y-6">
    <UAlert
      v-if="!liveCount"
      color="neutral"
      variant="soft"
      :title="emptyTitleResolved"
      :description="emptyDescriptionResolved"
    />

    <div class="space-y-6">
      <div class="space-y-2">
        <div class="flex items-center justify-between gap-3">
          <div class="text-xs uppercase tracking-[0.16em] text-toned">
            {{ hasSelected ? selectedTitleResolved : selectTitleResolved }}
          </div>

          <UButton
            v-if="hasSelected"
            color="neutral"
            variant="ghost"
            size="sm"
            icon="i-lucide-x"
            @click="emit('clear')"
          >
            Clear
          </UButton>
        </div>

        <slot v-if="selectedCard" name="selected-card" :card="selectedCard" />

        <p v-else class="text-sm text-dimmed">
          {{ selectDescriptionResolved }}
        </p>
      </div>

      <div v-if="isDev">
        <DevFireuxDebugPanel
          :title="debugTitleResolved"
          scope="console"
          :data="debug"
        />
      </div>

      <slot v-if="liveCount" name="live-collection" />
    </div>

    <section v-if="demoCards.length" class="w-full max-w-xl space-y-3">
      <div class="flex items-center gap-3">
        <div class="h-px flex-1 bg-default/60" />
        <div class="text-xs uppercase tracking-[0.16em] text-toned">Or</div>
        <div class="h-px flex-1 bg-default/60" />
      </div>

      <div class="space-y-2">
        <div class="text-sm font-medium text-highlighted">
          {{ demoTitleResolved }}
        </div>

        <USwitch
          v-model="showSimulationsModel"
          unchecked-icon="i-lucide-x"
          checked-icon="i-lucide-check"
          :label="demoSwitchLabelResolved"
        />
      </div>

      <div v-if="showSimulationsModel" class="space-y-2">
        <div class="text-sm text-dimmed">
          {{ demoDescriptionResolved }}
        </div>

        <div class="space-y-2">
          <slot
            v-for="card in demoCards"
            :key="card.id"
            name="demo-card"
            :card="card"
            :select="selectDemo"
          />
        </div>
      </div>
    </section>

    <section v-if="testCard || canCreateTest" class="w-full max-w-xl space-y-3">
      <div class="flex items-center gap-3">
        <div class="h-px flex-1 bg-default/60" />
        <div class="text-xs uppercase tracking-[0.16em] text-toned">Or</div>
        <div class="h-px flex-1 bg-default/60" />
      </div>

      <div class="space-y-2">
        <div class="text-sm font-medium text-highlighted">
          {{ testTitleResolved }}
        </div>

        <div class="text-sm text-dimmed">
          {{ testDescriptionResolved }}
        </div>

        <slot
          v-if="testCard"
          name="test-card"
          :card="testCard"
          :select="selectTest"
        />

        <UButton
          v-else-if="canCreateTest"
          color="neutral"
          variant="soft"
          icon="i-lucide-plus"
          :loading="creatingTest"
          @click="emit('createTest')"
        >
          {{ createTestLabelResolved }}
        </UButton>
      </div>
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type ConsoleEntityIndexCard = {
  id: string
} & Record<string, unknown>

const props = withDefaults(
  defineProps<{
    entityLabel: string
    entityLowerLabel?: string
    entityPluralLowerLabel?: string
    liveCount?: number
    hasSelected?: boolean
    selectedCard?: ConsoleEntityIndexCard | null
    demoCards?: ConsoleEntityIndexCard[]
    testCard?: ConsoleEntityIndexCard | null
    showSimulations?: boolean
    creatingTest?: boolean
    canCreateTest?: boolean
    debug?: unknown
    emptyTitle?: string
    emptyDescription?: string
    selectedTitle?: string
    selectTitle?: string
    selectDescription?: string
    demoTitle?: string
    demoSwitchLabel?: string
    demoDescription?: string
    testTitle?: string
    testDescription?: string
    createTestLabel?: string
    debugTitle?: string
  }>(),
  {
    entityLowerLabel: '',
    entityPluralLowerLabel: '',
    liveCount: 0,
    hasSelected: false,
    selectedCard: null,
    demoCards: () => [],
    testCard: null,
    showSimulations: false,
    creatingTest: false,
    canCreateTest: false,
    debug: null,
    emptyTitle: '',
    emptyDescription: '',
    selectedTitle: '',
    selectTitle: '',
    selectDescription: '',
    demoTitle: '',
    demoSwitchLabel: '',
    demoDescription: '',
    testTitle: '',
    testDescription: '',
    createTestLabel: '',
    debugTitle: '',
  }
)

const emit = defineEmits<{
  (event: 'update:showSimulations', value: boolean): void
  (event: 'clear'): void
  (event: 'selectDemo', id: string): void
  (event: 'selectTest'): void
  (event: 'createTest'): void
}>()

const isDev = import.meta.dev
const entityLower = computed(() =>
  props.entityLowerLabel || props.entityLabel.toLowerCase()
)
const entityPluralLower = computed(() =>
  props.entityPluralLowerLabel || `${entityLower.value}s`
)
const showSimulationsModel = computed({
  get: () => props.showSimulations,
  set: (value: boolean) => emit('update:showSimulations', value),
})
const emptyTitleResolved = computed(
  () => props.emptyTitle || `No live ${entityPluralLower.value} found`
)
const emptyDescriptionResolved = computed(
  () =>
    props.emptyDescription ||
    `No live ${entityPluralLower.value} are currently available in this workspace.`
)
const selectedTitleResolved = computed(
  () => props.selectedTitle || `Selected ${props.entityLabel}`
)
const selectTitleResolved = computed(
  () => props.selectTitle || `Select a ${entityLower.value}`
)
const selectDescriptionResolved = computed(
  () =>
    props.selectDescription ||
    `Choose a live, demo, or test ${entityLower.value} to load it into the console.`
)
const demoTitleResolved = computed(
  () => props.demoTitle || `Try a ${entityLower.value} simulation`
)
const demoSwitchLabelResolved = computed(
  () => props.demoSwitchLabel || `Show ${entityLower.value} simulations`
)
const demoDescriptionResolved = computed(
  () =>
    props.demoDescription ||
    `Read-only demo ${entityPluralLower.value} wired into the same console stack.`
)
const testTitleResolved = computed(
  () => props.testTitle || `Use your test ${entityLower.value}`
)
const testDescriptionResolved = computed(
  () =>
    props.testDescription ||
    `Personal sandbox ${entityLower.value} for experiments and console setup.`
)
const createTestLabelResolved = computed(
  () => props.createTestLabel || `Create Test ${props.entityLabel}`
)
const debugTitleResolved = computed(
  () => props.debugTitle || `${props.entityLabel} index`
)

const selectDemo = (id: string) => emit('selectDemo', id)
const selectTest = () => emit('selectTest')
</script>
