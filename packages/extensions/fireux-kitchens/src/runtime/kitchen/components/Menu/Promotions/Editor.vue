<template>
  <UCard>
    <template #header
      ><h2>
        {{ promotion ? 'Edit promotion' : 'New promotion' }}
      </h2></template
    >
    <form class="fx-card-body-stack" @submit.prevent="save">
      <UFormField label="Promotion type">
        <USelect
          v-model="form"
          :items="[
            { label: 'Dish offer', value: 'dish_offer' },
            { label: 'Meal deal', value: 'meal_deal' },
          ]"
          :disabled="disabled"
        />
      </UFormField>
      <UFormField label="Name"
        ><UInput v-model="name" :disabled="disabled"
      /></UFormField>
      <FireCopyError v-if="readError" :message="String(readError)" />
      <p v-else-if="editorPending" role="status">
        Refreshing promotion data… Your changes are kept.
      </p>
      <UAlert
        v-else-if="editorMissing"
        color="warning"
        title="This promotion is no longer available"
        description="Your changes are kept. Cancel to return to Promotions."
      />
      <KitchenMenuPromotionsDishOffer
        v-if="form === 'dish_offer'"
        v-model="rows"
        :dish-options="dishOptions"
        :currency="currency"
        :disabled="disabled"
      />
      <KitchenMenuPromotionsMealDeal
        v-else
        v-model:price="setPrice"
        v-model:groups="groups"
        :dish-options="dishOptions"
        :currency="currency"
        :disabled="disabled"
      />
      <UFormField label="Days">
        <FireMultiSelect
          v-model="days"
          label="Promotion days"
          :items="dayOptions"
          :disabled="disabled"
        />
      </UFormField>
      <UCheckbox v-model="active" label="Active" :disabled="disabled" />
      <p>
        {{
          form === 'meal_deal'
            ? 'Set the meal-deal price, included choices and any supplements.'
            : 'Active dish offers appear on published Menus during these days, using the venue’s time and serving hours.'
        }}
        Normal Dish prices stay unchanged.
      </p>
      <div class="fx-card__actions">
        <UButton
          type="submit"
          label="Save promotion"
          :loading="busy"
          :disabled="disabled"
        />
        <UButton
          type="button"
          label="Cancel"
          color="neutral"
          variant="soft"
          :disabled="busy"
          @click="closeEditor"
        />
      </div>
      <div v-if="error" role="alert">
        <p>{{ error }}</p>
        <FireCopyError :message="error" />
      </div>
    </form>
  </UCard>
</template>
<script setup lang="ts">
import { usePromotionEditor } from '../../../composables/promotions/usePromotionEditor'
const {
  promotion,
  currency,
  form,
  name,
  rows,
  setPrice,
  groups,
  days,
  active,
  busy,
  error,
  dishOptions,
  disabled,
  dayOptions,
  readError,
  editorPending,
  editorMissing,
  closeEditor,
  save,
} = usePromotionEditor()
</script>
