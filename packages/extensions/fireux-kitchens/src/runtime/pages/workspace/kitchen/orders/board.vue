<template><UDashboardPanel id="workspace-kitchen-order-board"><template #header><LayoutsWorkspaceNavbar title="Order board" /></template><template #body><KitchenOrdersBoard /></template></UDashboardPanel></template>
<script setup lang="ts">
definePageMeta({layout:'workspace',workspaceSurface:'browse',workspaceAccess:'public-entry',requiresAuth:false,requiresSelection:false,visibility:{modules:['fireux-kitchens']},nav:{hidden:true}})
</script>
