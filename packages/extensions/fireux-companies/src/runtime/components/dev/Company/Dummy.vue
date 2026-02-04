<template>
  <UCard>
    <template #header>
      <div class="flex items-start justify-between gap-3">
        <div class="space-y-2">
          <p class="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Dummy company surfaces
          </p>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            Preview Pill, Cell, Preview, and Profile surfaces using Place-hydrated companies.
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

    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <div class="space-y-2">
        <div class="text-xs font-medium text-dimmed">Pill</div>
        <CompanyCardsPill
          v-if="dummyPill"
          v-bind="dummyPill"
        />
      </div>

      <div class="space-y-2">
        <div class="text-xs font-medium text-dimmed">Cell</div>
        <CompanyCardsCell
          v-if="dummyCell"
          v-bind="dummyCell"
        />
      </div>

      <div class="space-y-2">
        <div class="text-xs font-medium text-dimmed">Preview</div>
        <CompanyCardsPreview
          v-if="dummyPreview"
          v-bind="dummyPreview"
        />
      </div>

      <div class="space-y-2">
        <div class="text-xs font-medium text-dimmed">Profile</div>
        <CompanyCardsProfile
          v-if="dummyProfile"
          :model="dummyProfile"
        />
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { dummyCompanyHydratedList } from '../../../../../../../../dummy/company.dummy'
import { useCompanyInterface } from '../../../composables/fireux/firestore/objects/company/utils/view/useCompanyInterface'
import type { CompanyView } from '../../../models/objects/company.model'

const { pill, cell, preview, profile } = useCompanyInterface()

const dummyCompanyList = dummyCompanyHydratedList as CompanyView[]

const selectedId = ref(String(dummyCompanyList[0]?.id ?? ''))

const selectedCompany = computed(() =>
  dummyCompanyList.find((company) => String(company.id) === selectedId.value)
)

const pillItems = computed(() =>
  dummyCompanyList
    .map((company) => {
      const card = pill(company)
      return {
        company,
        companyId: String(company.id ?? ''),
        card,
      }
    })
    .filter((item) => Boolean(item.card))
)

const dummyPill = computed(() => pill(selectedCompany.value ?? dummyCompanyList[0]))
const dummyCell = computed(() => cell(selectedCompany.value ?? dummyCompanyList[0]))
const dummyPreview = computed(() => preview(selectedCompany.value ?? dummyCompanyList[0]))
const dummyProfile = computed(() => profile(selectedCompany.value ?? dummyCompanyList[0]))

const selectCompany = (company: CompanyView) => {
  selectedId.value = String(company.id)
}
</script>
