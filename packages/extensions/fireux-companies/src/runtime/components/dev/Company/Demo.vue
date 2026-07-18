<template>
  <UCard>
    <template #header>
      <div class="flex items-start justify-between gap-3">
        <div class="space-y-2">
          <p class="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Demo surfaces for companies
          </p>
          <p class="text-xs text-muted">
            Demo surfaces for companies.
          </p>
        </div>
      </div>
    </template>

    <div class="flex flex-wrap gap-2">
      <CompanyCardsPill
        v-for="item in pillItems"
        :key="item.companyId"
        v-bind="item.card"
        action
        @action="selectCompany(item.company)"
      />
    </div>

    <div class="space-y-4">
      <div class="space-y-2">
        <div class="text-xs font-medium text-dimmed">Pill</div>
        <CompanyCardsPill
          v-if="demoPill"
          v-bind="demoPill"
        />
      </div>

      <div class="space-y-2">
        <div class="text-xs font-medium text-dimmed">Cell</div>
        <CompanyCardsCell
          v-if="demoCell"
          v-bind="demoCell"
        />
      </div>

      <div class="space-y-2">
        <div class="text-xs font-medium text-dimmed">Preview</div>
        <CompanyCardsPreview
          v-if="demoPreview"
          v-bind="demoPreview"
        />
      </div>

      <div class="space-y-2">
        <div class="text-xs font-medium text-dimmed">Profile</div>
        <CompanyCardsProfile
          v-if="demoProfile"
          :model="demoProfile"
        />
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { CompanyHydrated } from '../../../composables/fireux/firestore/company/fetch/types'
import { useCompanyInterface } from '../../../composables/fireux/firestore/company/utils/view/useCompanyInterface'
import type { CompanyCard } from '../../../composables/fireux/firestore/company/utils/view/useCompanyInterface'

const { pill, cell, preview, profile } = useCompanyInterface()

// Dev component canon: keep demo records local so app typecheck never imports root demo fixtures.
const demoCompanyList: CompanyHydrated[] = [
  {
    id: 'company-demo-harbor',
    created: { at: {} as any },
    updated: { at: {} as any },
    name: 'Harbor Produce Co.',
    short_name: 'Harbor Produce',
    short_address: 'Interlaken, Switzerland',
    formatted_address: 'Marktgasse 4, 3800 Interlaken, Switzerland',
    image_url: '',
    image_shade: 'none',
    source: 'manual',
  },
  {
    id: 'company-demo-atelier',
    created: { at: {} as any },
    updated: { at: {} as any },
    name: 'Atelier Linen Supply',
    short_name: 'Atelier Linen',
    short_address: 'Bern, Switzerland',
    formatted_address: 'Kramgasse 18, 3011 Bern, Switzerland',
    image_url: '',
    image_shade: 'none',
    source: 'manual',
  },
]
const isCompanyCard = (
  card: CompanyCard.Card | null
): card is CompanyCard.Card => Boolean(card)

const selectedId = ref(String(demoCompanyList[0]?.id ?? ''))

const selectedCompany = computed(() =>
  demoCompanyList.find((company) => String(company.id) === selectedId.value)
)

const pillItems = computed(() =>
  demoCompanyList
    .map((company) => {
      const card = pill(company)
      return {
        company,
        companyId: String(company.id ?? ''),
        card,
      }
    })
    .filter((item): item is Omit<typeof item, 'card'> & { card: CompanyCard.Card } =>
      isCompanyCard(item.card)
    )
)

const demoPill = computed(() => pill(selectedCompany.value ?? demoCompanyList[0]))
const demoCell = computed(() => cell(selectedCompany.value ?? demoCompanyList[0]))
const demoPreview = computed(() => preview(selectedCompany.value ?? demoCompanyList[0]))
const demoProfile = computed(() => profile(selectedCompany.value ?? demoCompanyList[0]))

const selectCompany = (company: CompanyHydrated) => {
  selectedId.value = String(company.id)
}
</script>
