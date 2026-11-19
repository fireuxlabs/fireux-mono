import { computed, ref, type Ref } from 'vue'

export function useLibraryCatalogue<
  T extends { name: string; description?: string },
>(rows: Ref<T[]>) {
  const query = ref('')
  const visible = computed(() => filterLibraryRows(rows.value, query.value))
  return { query, visible }
}

export function filterLibraryRows<
  T extends { name: string; description?: string },
>(rows: T[], query: string) {
  const search = query.trim().toLocaleLowerCase()
  return rows
    .filter(({ name, description }) =>
      `${name} ${description || ''}`.toLocaleLowerCase().includes(search)
    )
    .sort((a, b) => a.name.localeCompare(b.name))
}
