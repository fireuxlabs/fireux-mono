// Action: ENSURE · Phases: 1–4
// Sketch: Professional create (core + app, conditional)
// One doc, one action, one name. No wiring yet.

import { doc, getDoc } from 'firebase/firestore'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useSeoIndexWrite } from 'fireux-core/runtime/composables/fireux/seo/useSeoIndexWrite'
import { useUserEnsure } from 'fireux-core/runtime/composables/fireux/firestore/core/user/mutations/useUserEnsure'
import { useFirestoreCreate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCreate'
import { requireUid } from 'fireux-core/runtime/composables/fireux/firestore/utils/useEnsureCommon'
import { useFirestore } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import type { ProfessionalApp, ProfessionalCore } from '../../../../../../models/profiles/Professional/Professional.model'
import { professionalConfig } from 'fireux-jobs/runtime/composables/fireux/firestore/profiles/Professional/config/professionalConfig'

export function useProfessionalCreate() {
  const db = useFirestore()
  const { setDocument } = useFirestoreCreate()
  const { ensureUser } = useUserEnsure()
  const { upsertSeoIndexDoc } = useSeoIndexWrite()

  async function ensureProfessionalProfile(): Promise<{
    createdCore: boolean
    createdApp: boolean
    id: string
  }> {
    await ensureUser()
    const { uid } = await requireUid()
    const { appId, isTenant } = useFireUXConfig()

    let createdCore = false
    let createdApp = false

    const coreRef = doc(db, professionalConfig.collectionName, uid)
    const coreSnap = await getDoc(coreRef)
    if (!coreSnap.exists()) {
      const payload = {
        title: '',
        subtitle: '',
        tagline: '',
        summary: '',
        bio: '',
        image: '',
        positions: [],
        tags: [],
        relevant_experience: [],
        other_experience: [],
        languages: [],
        certifications: [],
        education: [],
        volunteering: [],
        projects: [],
      } satisfies Omit<ProfessionalCore, 'created' | 'updated' | 'id'>

      await setDocument<ProfessionalCore>(professionalConfig.collectionName, uid, payload as unknown as ProfessionalCore, {
        creator: true,
      })
      createdCore = true
    }

    if (isTenant && appId) {
      const appCollection = `apps/${appId}/${professionalConfig.collectionName}`
      const appRef = doc(db, 'apps', appId, professionalConfig.collectionName, uid)
      const appSnap = await getDoc(appRef)
      if (!appSnap.exists()) {
        const payload = {} satisfies Omit<ProfessionalApp, 'created' | 'updated' | 'id'>

        await setDocument<ProfessionalApp>(appCollection, uid, payload as unknown as ProfessionalApp, {
          creator: true,
        })
        createdApp = true
      }
    }

    await upsertSeoIndexDoc('seo_index_professionals', uid, {
      path: `/professionals/${uid}`,
      isPublic: true,
    })

    return { createdCore, createdApp, id: uid }
  }

  return { ensureProfessionalProfile }
}
*** Add File: /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/docs/reports/profile-canon-matrix.md
Authority: Tier2
Updated: 2026-03-17

# Profile Canon Matrix

Purpose: define the current and target field-language canon for the profile family so the next profile cleanup pass is semantic rather than ad hoc.

Scope:
- Chef
- Supplier
- Agent
- Professional
- Shared base in `profile.model.ts`

## Family Rule

The profile family now shares one structural rule:
- dual-layer entity class
- core profile document at the root collection
- optional app overlay at `apps/<appId>/<collection>/<uid>`
- shared seed/default path via `profile.model.ts`

The remaining design problem is field vocabulary, not structure.

## Recommended Canon

Universal profile presentation fields:
- `title`
- `subtitle`
- `tagline`
- `summary`
- `image`
- `tags`

Universal profile identity/stamps:
- `id`
- `created`
- `updated`

Species-specific fields:
- keep only fields that carry real domain meaning for that species

Deprecated carryovers:
- fields that duplicate the universal presentation layer
- fields kept only for migration compatibility

## Matrix

| Species | Universal Fields In Use Now | Species-Specific Fields To Keep | Deprecated Carryovers To Mark | Notes |
| --- | --- | --- | --- | --- |
| Chef | `title`, `subtitle`, `tagline`, `summary`, `tags` | `chef_signature_dishes`, `kitchen_ids`, `chef_organization_name` | `chef_bio`, `chef_image`, `bio_long`, `specialties`, `locations`, `organization_name` | `chef_bio` and `chef_image` are presentation-layer duplicates unless they encode meaning distinct from universal `summary` and `image`. |
| Supplier | `title`, `subtitle`, `tagline`, `summary`, `tags` | `supplier_product_categories`, `supplier_delivery_areas`, `supplier_organization_name`, `business_type`, `years_in_business`, `products_offered`, `employee_count`, `certifications`, `delivery_range` | `supplier_headline`, `supplier_bio`, `supplier_image`, `bio_long`, `categories`, `organization_name`, `locations` | Supplier has the most carryover vocabulary; much of it can collapse into universal presentation plus true supplier-specific business fields. |
| Agent | `title`, `subtitle`, `tagline`, `summary`, `tags` | `agent_placement_types`, `agent_coverage_areas`, `agent_contact_email`, `agent_contact_phone`, `agent_website_url` | `agent_bio`, `agent_image`, `contact_email`, `contact_phone`, `website_url` | Agent is close to the target shape; the main duplication is presentation/media and duplicated contact fields. |
| Professional | `title`, `subtitle`, `tagline`, `summary`, `tags` | `positions`, `relevant_experience`, `other_experience`, `languages`, `certifications`, `education`, `volunteering`, `projects` | `bio`, `image` only if the family decides to universalize them under those exact names; otherwise none yet | Professional is closest to the target language if the family adopts universal `summary` and `image` semantics. |

## Field Decisions

### Universal Fields

Keep as universal now:
- `title`
- `subtitle`
- `tagline`
- `tags`

Recommended to make universal next:
- `summary`
- `image`

Rationale:
- all profile cards and lists benefit from a common presentation layer
- species-specific prefixed bio/image fields are currently the main vocabulary drift
- shared UI can become simpler if every profile speaks one presentation language

### Species-Specific Fields

Chef:
- `chef_signature_dishes`
- `kitchen_ids`
- `chef_organization_name`

Supplier:
- `supplier_product_categories`
- `supplier_delivery_areas`
- `supplier_organization_name`
- `business_type`
- `years_in_business`
- `products_offered`
- `employee_count`
- `certifications`
- `delivery_range`

Agent:
- `agent_placement_types`
- `agent_coverage_areas`
- `agent_contact_email`
- `agent_contact_phone`
- `agent_website_url`

Professional:
- `positions`
- `relevant_experience`
- `other_experience`
- `languages`
- `certifications`
- `education`
- `volunteering`
- `projects`

### Deprecated Carryovers

Candidate deprecated presentation duplicates:
- Chef: `chef_bio`, `chef_image`
- Supplier: `supplier_headline`, `supplier_bio`, `supplier_image`
- Agent: `agent_bio`, `agent_image`

Candidate deprecated fallback/legacy fields:
- Chef: `bio_long`, `specialties`, `locations`, `organization_name`
- Supplier: `bio_long`, `categories`, `organization_name`, `locations`
- Agent: `contact_email`, `contact_phone`, `website_url`

## Migration Notes

Phase 1:
- treat `summary` and `image` as the target universal presentation layer
- keep current species-prefixed fields readable as fallbacks

Phase 2:
- update interface/computed helpers to prefer universal fields first
- preserve species-prefixed fields only as migration fallback

Phase 3:
- simplify create/update payloads so new writes populate universal fields directly
- stop writing duplicate presentation fields unless explicitly required for compatibility

Phase 4:
- remove deprecated fields after readers and existing data have been backfilled or tolerated

## Immediate Follow-Up

Small fallout already fixed during this audit:
- `useProfessionalCreate.ts` now seeds the universal profile fields added to `ProfessionalCore`

Recommended next code pass:
- converge the profile family on universal `summary` and `image`
- keep only true species fields outside that shared layer
