<template><UDashboardPanel id="kitchen-payments"><template #header><LayoutsWorkspaceNavbar title="Payments" /></template><template #body><WorkspaceKitchenFulfilment section="payments" /></template></UDashboardPanel></template>
<script setup lang="ts">
definePageMeta({layout:'workspace',requiresAuth:true,requiresSelection:true,visibility:{modules:['fireux-kitchens']},nav:{key:'workspace-kitchen-payments',label:'Payments',group:'Identity',groupDisplay:'nested',icon:'i-lucide-credit-card',position:'top',order:83,desktop:true,mobile:true,layouts:['workspace']}})
</script>
