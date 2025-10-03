<template>
  <section class="space-y-4">
    <h3 class="text-base font-semibold">{{ title }}</h3>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Left: list/editor using ObjectArray directly -->
      <div class="space-y-6 max-h-[70vh] overflow-y-auto pr-1">
        <MoleculesFormsFirestoreObjectArray
          ref="listRef"
          :label="title"
          :firebase-value="items"
          :update-function="onSave"
        >
          <template #display="{ item, index }">
            <OrganismsProfilesProfessionalFieldsExperienceField
              :item="item"
              :index="index"
              mode="display"
            />
          </template>

          <template #edit="{ item, index, remove }">
            <OrganismsProfilesProfessionalFieldsExperienceField
              :item="item"
              :index="index"
              mode="edit"
              :remove="remove"
            />
          </template>

          <template #create="{ push }">
            <OrganismsProfilesProfessionalFieldsExperienceQuickAdd
              @create="push"
            />
          </template>
        </MoleculesFormsFirestoreObjectArray>
      </div>

      <!-- Right: create-only panel that pushes into left list -->
      <div class="lg:sticky lg:top-4 self-start">
        <UCard>
          <template #header>
            <div class="font-medium">Add {{ title }}</div>
          </template>
          <OrganismsProfilesProfessionalFieldsExperienceQuickAdd
            @create="(item: any) => { listRef?.startEditing?.(); listRef?.push?.(item) }"
          />
        </UCard>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
// no imports required; components are auto-registered (ref is auto-imported in Nuxt)

const props = defineProps<{
  title: string
  items: any[]
  onSave: (items: any[]) => Promise<void> | void
}>()

const listRef = ref<any | null>(null)
</script>
