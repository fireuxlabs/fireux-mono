<template>
  <UDashboardPanel id="console-bnb-home">
    <template #header>
      <LayoutsConsoleNavbar title="BNB" />
    </template>

    <template #body>
      <section class="space-y-6">
        <UAlert
          v-if="!guides.live.length"
          color="neutral"
          variant="soft"
          title="No live BNB guides found"
          description="No live BuenoHost guides are currently available in this workspace."
        />

        <div class="space-y-6">
          <div class="space-y-2">
            <div class="flex items-center justify-between gap-3">
              <div class="text-xs uppercase tracking-[0.16em] text-toned">
                {{ selectedGuide ? 'Selected BNB Guide' : 'Select a BNB guide' }}
              </div>

              <UButton
                v-if="selectedGuide"
                color="neutral"
                variant="ghost"
                size="sm"
                icon="i-lucide-x"
                @click="clearSelectedGuide"
              >
                Clear
              </UButton>
            </div>

            <BnbGuidePill
              v-if="selectedGuideCard"
              :card="selectedGuideCard"
              @select="openGuide(selectedGuideCard.id, selectedMode)"
            />

            <p v-else class="text-sm text-dimmed">
              Choose a live, demo, or test guest guide to load it into the console.
            </p>
          </div>

          <div v-if="isDev">
            <DevFireuxDebugPanel
              title="BNB index"
              scope="console"
              :data="debug"
            />
          </div>

          <div v-if="guides.live.length" class="space-y-3">
            <div class="space-y-1">
              <h2 class="text-sm font-medium text-highlighted">Choose Live BNB Guide</h2>
              <p class="text-sm text-dimmed">Select the live guest guide you want to work on.</p>
            </div>

            <div class="w-full max-w-xl space-y-2">
              <BnbGuidePill
                v-for="guide in liveGuideCards"
                :key="guide.id"
                :card="guide"
                @select="openGuide(guide.id, 'live')"
              />
            </div>
          </div>
        </div>

        <section v-if="guides.demo.length" class="w-full max-w-xl space-y-3">
          <div class="flex items-center gap-3">
            <div class="h-px flex-1 bg-default/60" />
            <div class="text-xs uppercase tracking-[0.16em] text-toned">Or</div>
            <div class="h-px flex-1 bg-default/60" />
          </div>

          <div class="space-y-2">
            <div class="text-sm font-medium text-highlighted">Try a BNB guide simulation</div>

            <USwitch
              v-model="state.showSimulations"
              unchecked-icon="i-lucide-x"
              checked-icon="i-lucide-check"
              label="Show BNB guide simulations"
            />
          </div>

          <div v-if="state.showSimulations" class="space-y-2">
            <div class="text-sm text-dimmed">
              Read-only demo guides wired into the same console stack.
            </div>

            <BnbGuidePill
              v-for="guide in demoGuideCards"
              :key="guide.id"
              :card="guide"
              @select="openGuide(guide.id, 'demo')"
            />
          </div>
        </section>

        <section v-if="guides.test" class="w-full max-w-xl space-y-3">
          <div class="flex items-center gap-3">
            <div class="h-px flex-1 bg-default/60" />
            <div class="text-xs uppercase tracking-[0.16em] text-toned">Or</div>
            <div class="h-px flex-1 bg-default/60" />
          </div>

          <div class="space-y-2">
            <div class="text-sm font-medium text-highlighted">Use your test BNB guide</div>
            <div class="text-sm text-dimmed">
              Personal sandbox guide for experiments and console setup.
            </div>

            <BnbGuidePill
              v-if="testGuideCard"
              :card="testGuideCard"
              @select="openGuide(testGuideCard.id, 'test')"
            />
          </div>
        </section>
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { computed, defineComponent, h, reactive, type PropType } from 'vue'
import { useConsole, type ConsoleMode } from 'fireux-core/runtime/composables/fireux/app/console/useConsole'
import { bnbGuides, type BnbGuide } from '../../../content/bnbGuides'

type BnbGuideCard = {
  id: string
  title: string
  subtitle: string
  description: string
  imageUrl: string
  status: string
}

const state = reactive({
  showSimulations: true,
})

const guides = computed(() => ({
  live: bnbGuides.filter((guide) => guide.status === 'live'),
  demo: bnbGuides.filter((guide) => guide.status === 'demo'),
  test: null as BnbGuide | null,
}))

const consoleState = useConsole<BnbGuide, BnbGuide, BnbGuide>('bnb', {
  liveItems: computed(() => guides.value.live),
  demoItems: computed(() => guides.value.demo),
  testItem: computed(() => guides.value.test),
  getId: (guide) => guide.slug,
})

const selectedGuide = consoleState.selectedEntity
const selectedMode = consoleState.selectedMode
const isDev = import.meta.dev

const toGuideCard = (guide: BnbGuide): BnbGuideCard => ({
  id: guide.slug,
  title: guide.title,
  subtitle: guide.property.name,
  description: guide.guest_message?.subtitle || `/bnb/${guide.slug}`,
  imageUrl: '/img/app/logo.png',
  status: guide.status,
})

const liveGuideCards = computed(() => guides.value.live.map(toGuideCard))
const demoGuideCards = computed(() => guides.value.demo.map(toGuideCard))
const testGuideCard = computed(() => (guides.value.test ? toGuideCard(guides.value.test) : null))
const selectedGuideCard = computed(() => (selectedGuide.value ? toGuideCard(selectedGuide.value) : null))
const debug = computed(() => ({
  selectedId: consoleState.selectedId.value,
  selectedMode: consoleState.selectedMode.value,
  live: guides.value.live.map((guide) => guide.slug),
  demo: guides.value.demo.map((guide) => guide.slug),
  test: guides.value.test?.slug || null,
}))

function clearSelectedGuide() {
  consoleState.clearSelection()
}

async function openGuide(id: string, mode: ConsoleMode) {
  consoleState.selectEntity(id, mode)
  await navigateTo('/console/bnb/overview')
}

const BnbGuidePill = defineComponent({
  props: {
    card: {
      type: Object as PropType<BnbGuideCard>,
      required: true,
    },
  },
  emits: ['select'],
  setup(props, { emit }) {
    return () =>
      h(
        'button',
        {
          type: 'button',
          class:
            'w-full rounded-md border border-default bg-default/40 p-3 text-left transition hover:bg-elevated',
          onClick: () => emit('select'),
        },
        [
          h('div', { class: 'flex items-start gap-3' }, [
            h('img', {
              src: props.card.imageUrl,
              alt: props.card.title,
              class: 'size-10 rounded-md border border-default bg-elevated object-cover',
            }),
            h('div', { class: 'min-w-0 flex-1' }, [
              h('div', { class: 'flex flex-wrap items-center gap-2' }, [
                h('div', { class: 'truncate text-sm font-semibold text-highlighted' }, props.card.title),
                h(
                  'span',
                  {
                    class:
                      'rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium capitalize text-primary',
                  },
                  props.card.status
                ),
              ]),
              h('div', { class: 'mt-0.5 text-sm text-muted' }, props.card.subtitle),
              h('div', { class: 'mt-1 truncate text-xs text-dimmed' }, props.card.description),
            ]),
          ]),
        ]
      )
  },
})

definePageMeta({
  layout: 'console',
  nav: {
    key: 'console-bnb',
    label: 'BNB',
    icon: 'i-lucide-house-heart',
    position: 'bottom',
    requiresSelection: false,
    order: 900,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})
</script>
