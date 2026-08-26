// @fireux-script
// last_used: 2026-08-18
// usage_note: run through pnpm guard; protects ordinary entity update command grammar.

import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

const contracts = [
  [
    'fireux-blogs/src/runtime/composables/fireux/firestore/blog/mutations/useBlogUpdate.ts',
    'updateBlogPost',
    ['blogPostId'],
  ],
  [
    'fireux-compliance/src/runtime/portfolio/composables/workspace/operations/Compliance/mutations/useComplianceRecordUpdate.ts',
    'updateComplianceRecord',
    ['complianceRecordId'],
  ],
  [
    'fireux-documents/src/runtime/portfolio/composables/workspace/operations/Documents/mutations/useDocumentUpdate.ts',
    'updateDocumentRecord',
    ['documentId'],
  ],
  [
    'fireux-jobs/src/runtime/job/composables/firestore/mutations/useJobUpdate.ts',
    'updateJob',
    ['jobId'],
  ],
  [
    'fireux-kitchens/src/runtime/kitchen/composables/workspace/Mise/mutations/useKitchenMiseUpdate.ts',
    'updateKitchenMise',
    ['kitchenId', 'taskId'],
  ],
  [
    'fireux-kitchens/src/runtime/kitchen/composables/workspace/Stations/mutations/useKitchenStationUpdate.ts',
    'updateKitchenStation',
    ['kitchenId', 'stationId'],
  ],
  [
    'fireux-kitchens/src/runtime/kitchen/composables/workspace/team/mutations/useKitchenTeamMemberUpdate.ts',
    'updateKitchenTeamMember',
    ['kitchenId', 'memberId'],
  ],
  [
    'fireux-kitchens/src/runtime/ingredient/composables/firestore/mutations/useIngredientUpdate.ts',
    'updateIngredient',
    ['ingredientId'],
  ],
  [
    'fireux-kitchens/src/runtime/kitchen/composables/firestore/mutations/useKitchenUpdate.ts',
    'updateKitchen',
    ['kitchenId'],
  ],
  [
    'fireux-products/src/runtime/product/composables/firestore/mutations/useProductUpdate.ts',
    'updateProduct',
    ['productId'],
  ],
  [
    'fireux-properties/src/runtime/portfolio/composables/workspace/operations/Clients/mutations/useClientUpdate.ts',
    'updateClient',
    ['clientId'],
  ],
  [
    'fireux-properties/src/runtime/portfolio/composables/workspace/operations/Units/mutations/useUnitUpdate.ts',
    'updateUnit',
    ['unitId'],
  ],
  [
    'fireux-properties/src/runtime/portfolio/composables/firestore/mutations/usePortfolioUpdate.ts',
    'updatePortfolio',
    ['portfolioId'],
  ],
  [
    'fireux-properties/src/runtime/property/composables/firestore/mutations/usePropertyUpdate.ts',
    'updatePropertyRoot',
    ['propertyId'],
  ],
  [
    'fireux-reservations/src/runtime/property/composables/workspace/operations/Reservations/useReservationUpdate.ts',
    'updateReservation',
    ['reservationId'],
  ],
  [
    'fireux-tasks/src/runtime/portfolio/composables/workspace/operations/Tasks/mutations/useTaskUpdate.ts',
    'updateTask',
    ['taskId'],
  ],
  [
    'fireux-suppliers/src/runtime/supplier/composables/firestore/mutations/useSupplierUpdate.ts',
    'updateSupplierRoot',
    ['supplierId'],
  ],
]

export async function run({ repoRoot }) {
  const violations = []
  for (const [file, command, identities] of contracts) {
    const path = `packages/extensions/${file}`
    const source = await readFile(join(repoRoot, path), 'utf8')
    const declaration = new RegExp(
      `(?:function\\s+${command}|(?:const|let)\\s+${command}\\s*=\\s*(?:async\\s*)?)\\s*\\(\\s*input\\s*:`,
      'm'
    )
    const returned = new RegExp(`return\\s*{[^}]*\\b${command}\\b`, 's')
    const problems = []
    if (!declaration.test(source)) problems.push('typed input parameter')
    for (const identity of identities) {
      if (!source.includes(`input.${identity}`)) {
        problems.push(`input.${identity}`)
      }
    }
    if (!source.includes('input.changes')) problems.push('input.changes')
    if (!returned.test(source)) problems.push(`return { ${command} }`)

    if (problems.length) {
      violations.push(`${path}: ${command} is missing ${problems.join(', ')}.`)
    }
  }
  if (violations.length) {
    throw new Error(`Entity update contract drift:\n${violations.join('\n')}`)
  }
  console.log(
    '[guard] ✅ guarded update commands read named identity and changes'
  )
}
