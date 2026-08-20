export type KitchenTeamDossierDraft = {
  name: string
  role: string
  station: string
  certifications: string[]
  notes: string
  sourceFileName: string
  warnings: string[]
}

export const kitchenTeamDossierWorkflow = {
  id: 'kitchen.team.onboard-member-from-dossier',
  label: 'Onboard member',
  steps: ['upload', 'extract', 'review', 'create-member'],
} as const
