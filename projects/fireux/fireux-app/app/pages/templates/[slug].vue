<script setup lang="ts">
import { createError } from 'h3'
import { useRoute } from 'vue-router'

const route = useRoute()
if (route.params.slug !== 'template-one')
  throw createError({ statusCode: 404, statusMessage: 'Template not found' })

const query = route.fullPath.includes('?')
  ? `?${route.fullPath.split('?')[1]}`
  : ''
await navigateTo(`http://localhost:3001/templates/template-one${query}`, {
  external: true,
  redirectCode: 302,
})
</script>
