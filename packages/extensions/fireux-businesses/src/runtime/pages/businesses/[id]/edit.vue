<script setup lang="ts">
const id = useRouteParam('id')
definePageMeta({ layout: false, requiresAuth: true, pageTransition: false })
await navigateTo({ path: '/workspace/business', query: { business: id.value } }, { replace: true })
</script>
