<template>
  <client-only>
    <div class="dashboard-page-grid">
      <div class="dashboard-grid-section">
        <UCard>
          <template #default>
            <h2>Metric 1</h2>
            <p>Short text.</p>
          </template>
        </UCard>
      </div>
      <div class="dashboard-grid-section">
        <UCard>
          <template #default>
            <h2>Metric 2</h2>
            <p>A slightly longer placeholder text for analytics or charts.</p>
          </template>
        </UCard>
      </div>
      <div class="dashboard-grid-section">
        <UCard>
          <template #default>
            <h2>Metric 3</h2>
            <p>
              This metric contains a moderate amount of text to see how it
              adjusts.
            </p>
          </template>
        </UCard>
      </div>
      <div class="dashboard-grid-section">
        <UCard>
          <template #default>
            <h2>Metric 4</h2>
            <p>
              This section has a much longer piece of text to observe how it
              wraps inside the grid layout and whether it affects alignment with
              other cards.
            </p>
          </template>
        </UCard>
      </div>
      <div class="dashboard-grid-section">
        <UCard>
          <template #default>
            <h2>Metric 5</h2>
            <p>Very short.</p>
          </template>
        </UCard>
      </div>
      <div class="dashboard-grid-section">
        <UCard>
          <template #default>
            <h2>Metric 6</h2>
            <p>
              This one includes an image to see if media elements break the
              grid.
            </p>
            <img
              src="https://via.placeholder.com/150"
              alt="Placeholder Image"
            />
          </template>
        </UCard>
      </div>
    </div>
  </client-only>
</template>

<script setup>

const { label, icon } = getRouteMetaForPath('/admin/settings')

definePageMeta({
  layout: 'dashboard',
  layoutProps: {
    dashboardType: 'admin-dashboard',
  },
  title: label,
  icon: icon,
})
</script>
