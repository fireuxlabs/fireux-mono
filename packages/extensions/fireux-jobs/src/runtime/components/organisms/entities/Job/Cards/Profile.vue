<template>
  <UCard v-if="card">
    <div class="flex items-start gap-4">
      <!-- KitchenPill and CompanyPill replace avatar, fetched by IDs -->
      <KitchenPill
        v-if="card.workplaceType === 'kitchen' && card.workplaceId"
        :id="card.workplaceId"
        class="shrink-0"
      />
      <CompanyPill v-if="card.companyId" :id="card.companyId" class="shrink-0" />
      <div class="min-w-0 flex-1 space-y-1">
        <div class="flex items-center gap-2">
          <div class="truncate font-semibold text-lg">{{ card.title }}</div>
          <UBadge
            v-if="card.status"
            size="xs"
            variant="soft"
            :color="card.status === 'open' ? 'success' : 'neutral'"
          >
            {{ card.status === 'open' ? 'Open' : card.status }}
          </UBadge>
        </div>
        <div v-if="card.subtitle" class="truncate text-sm text-dimmed">{{ card.subtitle }}</div>
        <div v-if="card.description" class="text-sm mt-1">{{ card.description }}</div>
        <div v-if="card.badges?.length" class="flex flex-wrap gap-1 mt-1">
          <UBadge
            v-for="badge in card.badges"
            :key="badge"
            size="xs"
            variant="soft"
            color="neutral"
          >
            {{ badge }}
          </UBadge>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">

import { useCompanyFetch } from 'fireux-companies/runtime/composables/fireux/firestore/objects/company/fetch/useCompanyFetch';
import { useCompanyInterface } from 'fireux-companies/runtime/composables/fireux/firestore/objects/company/utils/view/useCompanyInterface';
import { useKitchenFetch } from 'fireux-kitchens/runtime/composables/fireux/firestore/objects/kitchen/fetch/useKitchenFetch';
import { useKitchenInterface } from 'fireux-kitchens/runtime/composables/fireux/firestore/objects/kitchen/utils/view/useKitchenInterface';
import { computed, defineComponent } from 'vue';
import type { JobCard } from '../../../../../composables/fireux/firestore/jobs/utils/view/useJobInterface';

const props = defineProps<{ card?: JobCard.Card }>()

defineExpose({});

// Local components for Kitchen and Company pills
const KitchenPill = defineComponent({
  props: { id: String },
  setup(props) {
    const { kitchen } = useKitchenFetch();
    const kitchenData = computed(() => props.id ? kitchen(props.id).value : null);
    const kitchenInterface = useKitchenInterface();
    const kitchenCard = computed(() => kitchenInterface.card(kitchenData.value));
    return { kitchenCard };
  },
  template: `
    <div v-if="kitchenCard" class="pill">
      <UUser
        :name="kitchenCard.title"
        :description="kitchenCard.subtitle"
        :avatar="{ src: kitchenCard.avatarUrl, alt: kitchenCard.title }"
        size="sm"
      />
    </div>
  `
});

const CompanyPill = defineComponent({
  props: { id: String },
  setup(props) {
    const { company } = useCompanyFetch();
    const companyData = computed(() => props.id ? company(props.id).value : null);
    const companyInterface = useCompanyInterface();
    const companyCard = computed(() => companyInterface.card(companyData.value));
    return { companyCard };
  },
  template: `
    <div v-if="companyCard" class="pill">
      <UUser
        :name="companyCard.title"
        :description="companyCard.subtitle"
        :avatar="{ src: companyCard.avatarUrl, alt: companyCard.title }"
        size="sm"
      />
    </div>
  `
});
</script>
