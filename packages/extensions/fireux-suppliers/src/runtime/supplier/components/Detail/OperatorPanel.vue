<!-- Concurrent edit — 2026-07-21 13:51 CEST — CSS necessity pass: let Nuxt UI own the public-action card root geometry. -->
<template>
  <UCard class="fx-card--public-action">
    <div class="fx-public-action">
      <div class="fx-public-action__badges">
        <UBadge color="primary" variant="soft"> Operator </UBadge>
      </div>

      <div class="fx-public-action__body">
        <UAvatar
          icon="i-lucide-key-round"
          size="md"
          class="fx-public-action__avatar"
        />

        <div class="fx-public-action__content">
          <div class="fx-public-action__copy">
            <h2 class="fx-public-action__title">Supplier Operations</h2>
            <p class="fx-public-action__description">
              {{ panelDescription }}
            </p>
          </div>

          <div v-if="groups.length" class="fx-public-action__groups">
            <div
              v-for="group in groups"
              :key="group.label"
              class="fx-public-action__group"
            >
              <p class="fx-public-action__label">
                {{ group.label }}
              </p>
              <div class="fx-public-action__chips">
                <UBadge
                  v-for="item in group.items"
                  :key="item"
                  :color="group.color"
                  variant="soft"
                >
                  {{ item }}
                </UBadge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  visiblePublicActionGroups,
  type PublicActionGroup,
} from 'fireux-core/runtime/composables/public/usePublicActionPanel'
import type { SupplierSurface } from '../../composables/firestore/utils/view/useSupplierInterface'

const props = defineProps<{
  supplier?: SupplierSurface | null
}>()

const aligned = ['Identity', 'Item', 'Catalogue', 'Ingredient']
const notAligned: string[] = []
const supplierName = computed(() =>
  String(
    props.supplier?.company_place?.short_name ||
      props.supplier?.company_place?.name ||
      props.supplier?.identity?.slug ||
      ''
  ).trim()
)
const panelDescription = computed(() =>
  supplierName.value
    ? `Supplier operators manage catalogue items, ingredients, and supplier work for ${supplierName.value}.`
    : 'Supplier operators manage catalogue items, ingredients, and supplier work from the supplier workspace.'
)
const groups = computed<PublicActionGroup[]>(() =>
  visiblePublicActionGroups([
    {
      label: 'Aligned',
      items: aligned,
      color: 'primary' as const,
    },
    {
      label: 'Not aligned yet',
      items: notAligned,
      color: 'neutral' as const,
    },
  ])
)
</script>
