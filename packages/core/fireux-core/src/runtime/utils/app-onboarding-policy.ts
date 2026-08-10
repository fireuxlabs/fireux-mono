import type { FireUXConfig } from '../composables/fireux/app/FireUXConfig'
import type {
  AppOnboardingPlacementOption,
  AppOnboardingPolicy,
} from '../models/operations/app-onboarding'

/**
 * Resolve what the current App is allowed to offer without teaching the page
 * about another environment. The host is placement authority; the browser is
 * not allowed to supply project, database, or ecosystem identifiers.
 */
export function resolveAppOnboardingPolicy(
  config: Readonly<FireUXConfig>
): AppOnboardingPolicy {
  const primary_entity_options = config.consoleRegistry.flatMap(
    registration => {
      const onboarding = registration.appOnboarding
      if (
        !onboarding ||
        onboarding.primaryEntity !== 'required' ||
        !onboarding.label.trim() ||
        !onboarding.description.trim() ||
        !onboarding.rootOnboardingPath.startsWith('/')
      ) return []
      return [{
        family: registration.family,
        label: onboarding.label.trim(),
        description: onboarding.description.trim(),
        root_onboarding_path: onboarding.rootOnboardingPath,
      }]
    }
  )
  const base = {
    host_app_id: config.appId,
    host_app_name: config.appName,
    primary_entity_options,
  }

  if (!config.isGlobal) {
    return {
      ...base,
      options: [],
      unavailable_reason:
        'New Apps are created from an ecosystem Main App or from FireUX.',
    }
  }

  const ecosystemId = String(config.ecosystemId || '').trim()
  if (!ecosystemId) {
    return {
      ...base,
      options: [],
      unavailable_reason:
        'This Main App is missing its canonical ecosystem relationship.',
    }
  }

  const tenant: AppOnboardingPlacementOption = {
    id: 'tenant',
    app_role: 'tenant',
    target_ecosystem_id: ecosystemId,
  }

  if (config.ecosystem !== 'fireux') {
    return {
      ...base,
      options: [tenant],
      locked_placement: 'tenant',
    }
  }

  return {
    ...base,
    options: [
      tenant,
      { id: 'standalone', app_role: 'standalone' },
      { id: 'ecosystem', app_role: 'global' },
    ],
  }
}
