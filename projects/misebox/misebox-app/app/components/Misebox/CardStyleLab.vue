<template>
  <section class="card-style-lab" aria-labelledby="card-style-lab-title">
    <header class="card-style-lab__header">
      <div>
        <p class="card-style-lab__eyebrow">Isolated style lab</p>
        <h2 id="card-style-lab-title">Find the visual language</h2>
        <p>
          The baseline uses Nuxt UI primitives without the shared FireUX Card
          classes. Experimental styles remain local to this lab.
        </p>
      </div>

      <UBadge color="success" variant="subtle" icon="i-lucide-flask-conical">
        Core Card CSS bypassed
      </UBadge>
    </header>

    <div class="card-style-lab__controls">
      <div class="card-style-lab__mode-scroll">
        <UFieldGroup
          class="card-style-lab__mode-group"
          size="sm"
          aria-label="Art direction"
        >
          <UButton
            v-for="option in styleOptions"
            :key="option.value"
            :icon="option.icon"
            :label="option.label"
            :color="activeStyle === option.value ? 'primary' : 'neutral'"
            :variant="activeStyle === option.value ? 'solid' : 'ghost'"
            :aria-pressed="activeStyle === option.value"
            @click="activeStyle = option.value"
          />
        </UFieldGroup>
      </div>

      <p>{{ activeOption.description }}</p>
    </div>

    <div class="card-style-lab__canvas" :data-style="activeStyle">
      <article class="card-style-lab__specimen">
        <span>Cell</span>
        <UCard :class="surfaceClass('cell')">
          <div class="flex min-w-0 items-center gap-3">
            <UAvatar :src="deanosClassicImage" alt="Deanos Classic" size="lg" />
            <div class="min-w-0 flex-1">
              <p class="truncate font-semibold text-highlighted">
                Deanos Classic
              </p>
              <p class="card-style-lab__data truncate text-sm text-muted">
                Main Menu · 18 CHF
              </p>
            </div>
            <UBadge color="success" variant="subtle" size="xs"> Live </UBadge>
          </div>
        </UCard>
      </article>

      <article class="card-style-lab__specimen">
        <span>Pill</span>
        <UButton
          color="neutral"
          variant="outline"
          size="xl"
          class="w-full justify-start"
          :class="surfaceClass('pill')"
        >
          <UAvatar
            :src="deanosClassicImage"
            alt=""
            size="sm"
            class="card-style-lab__pill-avatar"
          />
          <span class="card-style-lab__pill-copy min-w-0 flex-1 text-left">
            <span class="block truncate font-semibold">Main Menu</span>
            <span
              class="card-style-lab__data block truncate text-xs opacity-70"
            >
              Deanos Kitchen
            </span>
          </span>
          <UIcon
            name="i-lucide-chevron-right"
            class="card-style-lab__pill-arrow size-4 shrink-0"
          />
        </UButton>
      </article>

      <article
        class="card-style-lab__specimen card-style-lab__specimen--preview"
      >
        <span>Preview</span>
        <UCard :class="surfaceClass('preview')">
          <template #header>
            <div class="flex items-start justify-between gap-4">
              <div>
                <p class="card-style-lab__eyebrow">Kitchen signature</p>
                <h3 class="mt-1 text-xl font-bold text-highlighted">
                  Deanos Classic
                </h3>
              </div>
              <UBadge color="primary" variant="soft">18 CHF</UBadge>
            </div>
          </template>

          <img
            :src="deanosClassicImage"
            alt="Deanos Classic smash burger"
            class="card-style-lab__hero-image"
            loading="lazy"
          />

          <p class="mt-4 text-sm leading-relaxed text-muted">
            Double smash patties, cheddar, pickles, lettuce and house sauce.
          </p>

          <div
            v-if="activeStyle === 'utility' || activeStyle === 'kds'"
            class="card-style-lab__telemetry"
          >
            <span>ETA 04:20</span>
            <span>GRILL 02</span>
            <span>QUEUE 08</span>
          </div>

          <template #footer>
            <div class="flex items-center justify-between gap-3">
              <div class="flex gap-1">
                <UBadge color="neutral" variant="outline" size="xs"
                  >Popular</UBadge
                >
                <UBadge color="neutral" variant="outline" size="xs"
                  >Burger</UBadge
                >
              </div>
              <UButton
                color="primary"
                variant="soft"
                size="sm"
                trailing-icon="i-lucide-arrow-up-right"
              >
                View dish
              </UButton>
            </div>
          </template>
        </UCard>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from '#imports'
import { miseboxDemoMediaUrl } from 'fireux-core/runtime/utils/misebox-demo-media'

type CardLabStyle =
  | 'baseline'
  | 'swiss'
  | 'gallery'
  | 'tonal'
  | 'noir'
  | 'modular'
  | 'utility'
  | 'kds'
type CardLabVariant = 'cell' | 'pill' | 'preview'

const deanosClassicImage = miseboxDemoMediaUrl(
  'kitchens/deanos/menu/deanos-classic.jpg'
)

const styleOptions: Array<{
  value: CardLabStyle
  label: string
  icon: string
  description: string
}> = [
  {
    value: 'baseline',
    label: 'Nuxt UI',
    icon: 'i-lucide-box',
    description: 'Unstyled Nuxt UI primitives and semantic colour tokens.',
  },
  {
    value: 'swiss',
    label: 'Swiss grid',
    icon: 'i-lucide-grid-2x2',
    description:
      'Precise alignment, flat planes and typographic structure with one decisive rule.',
  },
  {
    value: 'gallery',
    label: 'Gallery',
    icon: 'i-lucide-image',
    description:
      'Image-first cards with quiet framing and the product treated as the artwork.',
  },
  {
    value: 'tonal',
    label: 'Colour field',
    icon: 'i-lucide-palette',
    description:
      'Confident tonal surfaces where status colour becomes the composition.',
  },
  {
    value: 'noir',
    label: 'Noir line',
    icon: 'i-lucide-minus',
    description:
      'High-fashion restraint: dark ink, hairline framing and deliberate emptiness.',
  },
  {
    value: 'modular',
    label: 'Modular',
    icon: 'i-lucide-panels-top-left',
    description:
      'Segmented information blocks inspired by menus, tickets and kitchen equipment.',
  },
  {
    value: 'utility',
    label: 'Nuxt utility',
    icon: 'i-lucide-scan-line',
    description:
      'Nuxt UI typography and rhythm with restrained sci-fi depth, precision edges and functional telemetry.',
  },
  {
    value: 'kds',
    label: 'Live KDS',
    icon: 'i-lucide-radio-tower',
    description:
      'Real-time kitchen hardware blocks with functional amber, lime and alert states.',
  },
]

const activeStyle = ref<CardLabStyle>('utility')
const activeOption = computed(
  () =>
    styleOptions.find((option) => option.value === activeStyle.value) ||
    styleOptions[0]
)

const surfaceClass = (variant: CardLabVariant) => {
  if (activeStyle.value === 'baseline') return []
  return [
    'card-style-lab__surface',
    `card-style-lab__surface--${variant}`,
    `card-style-lab__surface--${activeStyle.value}`,
  ]
}
</script>

<style scoped src="./card-style-lab.css"></style>
