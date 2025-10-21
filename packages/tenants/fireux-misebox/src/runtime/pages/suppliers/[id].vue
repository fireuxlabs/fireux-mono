<template>
  <OrganismsProfilePage
    :config="supplierConfig"
    edit-path="/dashboard/supplier-profile"
    page-title="Supplier Profile"
    page-description="View supplier profile"
    :fallback-href="'/suppliers'"
  >
    <template #profile="{ profile }">
      <OrganismsProfilesSupplierCardsProfile :supplier="profile" />
    </template>
  </OrganismsProfilePage>
</template>

<script setup lang="ts">
import OrganismsProfilePage from 'fireux-core/runtime/components/organisms/Profile/Page.vue'
import { supplierConfig } from '../../models/profiles/Supplier.model'
</script>
