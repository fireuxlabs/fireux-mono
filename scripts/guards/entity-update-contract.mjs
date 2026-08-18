// @fireux-script
// last_used: 2026-08-18
// usage_note: run through pnpm guard; protects ordinary entity update command grammar.

import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

const contracts = [
  [
    'packages/extensions/fireux-blogs/src/runtime/composables/fireux/firestore/blog/mutations/useBlogUpdate.ts',
    'updateBlogPost',
  ],
  [
    'packages/extensions/fireux-compliance/src/runtime/portfolio/composables/console/operations/Compliance/mutations/useComplianceRecordUpdate.ts',
    'updateComplianceRecord',
  ],
  [
    'packages/extensions/fireux-documents/src/runtime/portfolio/composables/console/operations/Documents/mutations/useDocumentUpdate.ts',
    'updateDocumentRecord',
  ],
  [
    'packages/extensions/fireux-jobs/src/runtime/job/composables/firestore/mutations/useJobUpdate.ts',
    'updateJob',
  ],
  [
    'packages/extensions/fireux-kitchens/src/runtime/kitchen/composables/console/operations/Mise/mutations/useKitchenMiseUpdate.ts',
    'updateKitchenMise',
  ],
  [
    'packages/extensions/fireux-kitchens/src/runtime/kitchen/composables/console/operations/Stations/mutations/useKitchenStationUpdate.ts',
    'updateKitchenStation',
  ],
  [
    'packages/extensions/fireux-kitchens/src/runtime/kitchen/composables/console/team/mutations/useKitchenTeamMemberUpdate.ts',
    'updateKitchenTeamMember',
  ],
  [
    'packages/extensions/fireux-kitchens/src/runtime/ingredient/composables/firestore/mutations/useIngredientUpdate.ts',
    'updateIngredient',
  ],
  [
    'packages/extensions/fireux-kitchens/src/runtime/kitchen/composables/firestore/mutations/useKitchenUpdate.ts',
    'updateKitchen',
  ],
  [
    'packages/extensions/fireux-products/src/runtime/product/composables/firestore/mutations/useProductUpdate.ts',
    'updateProduct',
  ],
  [
    'packages/extensions/fireux-properties/src/runtime/portfolio/composables/console/operations/Clients/mutations/useClientUpdate.ts',
    'updateClient',
  ],
  [
    'packages/extensions/fireux-properties/src/runtime/portfolio/composables/console/operations/Units/mutations/useUnitUpdate.ts',
    'updateUnit',
  ],
  [
    'packages/extensions/fireux-properties/src/runtime/portfolio/composables/firestore/mutations/usePortfolioUpdate.ts',
    'updatePortfolio',
  ],
  [
    'packages/extensions/fireux-properties/src/runtime/property/composables/firestore/mutations/usePropertyUpdate.ts',
    'updatePropertyRoot',
  ],
  [
    'packages/extensions/fireux-reservations/src/runtime/property/composables/console/operations/Reservations/useReservationUpdate.ts',
    'updateReservation',
  ],
  [
    'packages/extensions/fireux-tasks/src/runtime/portfolio/composables/console/operations/Tasks/mutations/useTaskUpdate.ts',
    'updateTask',
  ],
  [
    'packages/extensions/fireux-suppliers/src/runtime/supplier/composables/firestore/mutations/useSupplierUpdate.ts',
    'updateSupplierRoot',
  ],
]

export async function run({ repoRoot }) {
  const violations = []
  for (const [file, command] of contracts) {
    const source = await readFile(join(repoRoot, file), 'utf8')
    const escaped = command.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const declaration = new RegExp(
      `(?:function\\s+${escaped}|(?:const|let)\\s+${escaped}\\s*=\\s*(?:async\\s*)?)\\s*\\(\\s*input\\s*:`,
      'm'
    )
    if (!declaration.test(source) || !/\bchanges\s*:/.test(source)) {
      violations.push(
        `${file}: ${command} must accept one typed input object with named identity and changes.`
      )
    }
  }
  const teamServerFile =
    'packages/extensions/fireux-kitchens/src/runtime/kitchen/server/team/update.ts'
  const teamServer = await readFile(join(repoRoot, teamServerFile), 'utf8')
  if (
    !teamServer.includes('input: UpdateKitchenTeamMemberInput') ||
    !teamServer.includes('changes: KitchenTeamMemberChanges') ||
    !teamServer.includes('updates: KitchenTeamMemberUpdate[]')
  ) {
    violations.push(
      `${teamServerFile}: manual and batch Team updates must share the canonical changes contract.`
    )
  }
  if (violations.length) {
    throw new Error(`Entity update contract drift:\n${violations.join('\n')}`)
  }
  console.log(
    '[guard] ✅ ordinary entity update commands use named identity and changes'
  )
}
