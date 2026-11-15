/** Reviewed common guidance, authored once. These are prompts, not venue facts. */
export const kitchenGuidance = [
  {
    id: 'high-street',
    title: 'High street kitchen',
    summary:
      'Plan for changing demand and a menu that must work during service.',
    guidance: [
      'Ask which service, trading period and expected demand the operator is planning for; do not infer covers or opening hours from the location.',
      'Consider preparation time, holding requirements and service bottlenecks when comparing menu ideas.',
      'Prefer useful overlap between dishes where appropriate, while checking the kitchen’s actual equipment, quantities and methods.',
    ],
  },
  {
    id: 'small-team',
    title: 'Small team kitchen',
    summary: 'Keep preparation and service manageable with limited capacity.',
    guidance: [
      'Ask about available preparation and service capacity before proposing extra work; this guide does not establish staffing levels.',
      'Prefer clear, repeatable preparation steps and identify tasks competing for the same equipment or station.',
      'When offering alternatives, explain their effect on workload and complexity. Never assume extra people or equipment are available.',
    ],
  },
  {
    id: 'existing-ingredients',
    title: 'Use existing ingredients',
    summary: 'Start menu ideas with what the kitchen already has.',
    guidance: [
      'Start with ingredients and preparations the operator confirms are available. A catalogue entry alone does not prove stock on hand.',
      'For a special or substitution, check usable quantities and the needs of the regular menu before suggesting an amount to make.',
      'Ask before proposing purchases. Do not invent ingredients, recipe methods, yields, allergen information or safe holding times.',
    ],
  },
] as const

export type KitchenGuidanceId = (typeof kitchenGuidance)[number]['id']

/** Unknown references never introduce arbitrary instructions into KitchenAI. */
export function resolveKitchenGuidance(ids: unknown) {
  if (!Array.isArray(ids)) return []
  return kitchenGuidance.filter((guide) => ids.includes(guide.id))
}
