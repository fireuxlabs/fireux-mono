const jobsPagesRoot = 'packages/extensions/fireux-jobs/src/runtime/pages/'
const professionalProfilePage =
  'packages/extensions/fireux-jobs/src/runtime/pages/dashboard/professional/profile.vue'

const keepFindMySeoJobsRoute = (file: string) => {
  if (!file.includes(jobsPagesRoot)) return true

  return file.endsWith(professionalProfilePage)
}

export function filterFindMySeoPages(pages: any[]) {
  for (let index = pages.length - 1; index >= 0; index -= 1) {
    const page = pages[index]
    if (Array.isArray(page?.children)) {
      filterFindMySeoPages(page.children)
    }

    const file = typeof page?.file === 'string' ? page.file : ''
    if (file && !keepFindMySeoJobsRoute(file)) {
      pages.splice(index, 1)
    }
  }
}

export const findMySeoNuxtOverrides = {
  hooks: {
    'pages:extend'(pages: any[]) {
      filterFindMySeoPages(pages)
    },
  },
}
