<template>
  <UDashboardPanel id="home">
    <template #header>
      <FireLayoutsDashboardNavbar title="Overview" />
    </template>

    <template #body>
      <UPage>
        <UPageBody class="pagebody fx-account-content">
          <FireDashboardOverview />
        </UPageBody>
      </UPage>
    </template>
  </UDashboardPanel>
</template>
