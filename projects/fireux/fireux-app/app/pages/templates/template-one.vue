<script setup lang="ts">
const suffix = useRoute().fullPath.match(/[?#].*$/)?.[0] ?? ''
await navigateTo(
  `https://misebox.app/templates/template-one${suffix}`,
  { external: true, redirectCode: 302 }
)
</script>
