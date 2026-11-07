<template>
  <UCard>
    <template #header>
      <div class="card__header">
        <span>Quick peek</span>
        <UBadge variant="subtle" color="neutral">At a glance</UBadge>
      </div>
    </template>

    <ul class="fx-list-stack">
      <li v-for="item in items" :key="item.title">
        <div class="pagebody">
          <UIcon :name="item.icon" />
        </div>
        <div>
          <h3 class="fx-type-card-heading">{{ item.title }}</h3>
          <p class="fx-type-caption">
            {{ item.copy }}
          </p>
        </div>
      </li>
    </ul>

    <template #footer>
      <UBadge variant="soft" color="primary">{{ footerBadge }}</UBadge>
    </template>
  </UCard>
</template>

<script setup lang="ts">
export interface QuickPeekItem {
  title: string
  copy: string
  icon: string
}

defineProps<{ items: QuickPeekItem[]; footerBadge: string }>()
</script>
