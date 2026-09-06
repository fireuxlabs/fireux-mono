import { kitchenTeamTools } from '../tools/team'

export type KitchenTeamProposedTool = {
  id: `kitchen.team.${string}`
  label: string
  layer: 'human' | 'ai-assisted' | 'compound'
  purpose: string
  evidence: readonly string[]
  authority: string
  approval: string
  status: 'requested'
}

export const kitchenTeamSearchDemand = {
  observedAt: '2026-08-23',
  geography: 'English-language web',
  language: 'English',
  question: 'What Kitchen-specific team, responsibility, training and handover jobs are operators trying to perform?',
  method:
    'Current restaurant workforce and safety literature establishes operational Team jobs. Existing FireUX Team records and registered Tools establish present capability. Proposed training and handover Tools remain separate until their evidence models exist.',
  seeds: [
    {
      seed: 'Kitchen Team management',
      queries: ['kitchen staff roles and responsibilities', 'restaurant kitchen team management', 'kitchen station responsibilities'],
    },
    {
      seed: 'Kitchen training',
      queries: ['restaurant employee training checklist', 'kitchen staff training matrix', 'food safety certification tracking restaurant'],
    },
    {
      seed: 'Kitchen handover',
      queries: ['restaurant shift handover checklist', 'kitchen shift handover log', 'chef handover notes'],
    },
  ],
  clusters: [
    {
      id: 'members',
      title: 'Maintain the Kitchen roster',
      operatorJob: 'Record the people who work in this Kitchen, link a member to a User when invited, and preserve member identity independently from account identity.',
      owner: 'WorkspaceTeamMemberDocument with User and AppUser boundaries',
      interpretation: 'A named Team member may exist before login. Team membership does not itself create a User, App membership or Workspace access.',
    },
    {
      id: 'responsibility',
      title: 'Assign Kitchen responsibility',
      operatorJob: 'Record Kitchen role and Station responsibility without treating a label as verified competence or access authority.',
      owner: 'Kitchen Team and Stations',
      interpretation: 'Role, Station assignment, skill evidence and permission are separate facts.',
    },
    {
      id: 'competence',
      title: 'Know who is trained for the work',
      operatorJob: 'Record reviewed Station competence, required training, completion evidence, certification issuer and expiry.',
      owner: 'Kitchen Team evidence composed with Stations and Food Safety',
      interpretation: 'A note or uploaded file does not automatically prove competence. Every claim needs type, source, reviewer and effective dates.',
    },
    {
      id: 'handover',
      title: 'Hand operational context to the next Team',
      operatorJob: 'Record unresolved work, exceptions and acknowledgements for a Kitchen-local shift or service.',
      owner: 'Team handover referencing owning capability records',
      interpretation: 'Handover links to Orders, Mise, Inventory, Food Safety and other owners; it does not duplicate their records or become generic task storage.',
    },
  ],
  validationSources: [
    {
      label: 'National Restaurant Association job descriptions',
      url: 'https://restaurant.org/education-and-resources/learning-center/workforce-engagement/restaurant-industry-job-descriptions/',
      note: 'Validates distinct Kitchen responsibilities, Station work, coordination, ongoing training and food-safety duties.',
    },
    {
      label: 'National Restaurant Association food-safety training',
      url: 'https://restaurant.org/education-and-resources/learning-center/food-nutrition/food-safety/',
      note: 'Validates Kitchen training and certification as operational evidence, including hygiene, preparation, cooking and temperature safety.',
    },
    {
      label: 'OSHA restaurant food-preparation safety',
      url: 'https://www.osha.gov/etools/young-workers-restaurant-safety/food-prep',
      note: 'Validates equipment-specific training, safe work practices and age-sensitive restrictions rather than generic skill labels.',
    },
  ],
  records: [
  {
    id: 'kitchen.team.member',
    label: 'Kitchen Team member',
    kind: 'owned',
    status: 'available',
    owner: 'Team',
    authority: 'Team owns the Kitchen-local named member and keeps it distinct from User identity, App membership and access.',
    facts: [ 'member identity and optional User link', 'assigned workspace role labels' ],
    readBy: [
      'kitchen.team.read-members',
      'kitchen.team.update-member',
      'kitchen.team.delete-member',
      'kitchen.team.create-invitation',
      'kitchen.team.record-station-competence',
      'kitchen.team.record-training',
      'kitchen.team.create-handover'
    ],
    writtenBy: [ 'kitchen.team.create-member', 'kitchen.team.update-member', 'kitchen.team.delete-member' ]
  },
  {
    id: 'kitchen.team.competence-evidence',
    label: 'Competence and training evidence',
    kind: 'owned',
    status: 'requested',
    owner: 'Team',
    authority: 'Reviewed, dated evidence remains separate from roles, permissions and unverified uploaded material.',
    facts: [ 'member and requirement', 'evidence source and reviewer', 'effective and expiry dates', 'review status' ],
    readBy: [],
    writtenBy: [ 'kitchen.team.record-station-competence', 'kitchen.team.record-training' ]
  },
  {
    id: 'kitchen.team.handover',
    label: 'Shift handover',
    kind: 'owned',
    status: 'requested',
    owner: 'Team',
    authority: 'Handover owns its time-bound envelope and references unresolved records without copying them.',
    facts: [ 'period and author', 'recipient scope', 'linked operational records', 'notes and acknowledgement' ],
    readBy: [],
    writtenBy: [ 'kitchen.team.create-handover' ]
  }
],
  recordQuestions: [
    'Which selected Kitchen owns this Team member row?',
    'Is this a named member, linked User, AppUser or authorized operator—and which relationships actually exist?',
    'Which Kitchen role and Station assignments are recorded, and when are they effective?',
    'What evidence supports each competence, training or certification claim?',
    'Who reviewed the evidence, when does it expire, and what remains unknown?',
    'Which handover period, author, recipients and acknowledgements apply?',
    'Which linked operational record owns each handover issue?',
    'Does any field incorrectly introduce payroll, scheduling, generic HR or access authority?',
  ],
  liveTools: kitchenTeamTools,
  proposedTools: [
    {
      id: 'kitchen.team.record-station-competence',
      label: 'Record Station Competence',
      layer: 'human',
      purpose: 'Record a reviewed, time-bound competence claim for one member and Station.',
      evidence: ['member', 'Station', 'competence definition', 'reviewer', 'evidence reference', 'effective and expiry dates'],
      authority: 'Kitchen Team owns the member evidence; Station owns Station identity and requirements.',
      approval: 'Explicit reviewer submission is required.',
      status: 'requested',
    },
    {
      id: 'kitchen.team.record-training',
      label: 'Record Training Evidence',
      layer: 'human',
      purpose: 'Record completion or certification evidence without inferring competence from a file or note.',
      evidence: ['training definition', 'member', 'provider or issuer', 'completion', 'expiry', 'reviewer'],
      authority: 'Team owns the member evidence; Food Safety owns food-safety requirements and compliance interpretation.',
      approval: 'Explicit operator or reviewer submission is required.',
      status: 'requested',
    },
    {
      id: 'kitchen.team.create-handover',
      label: 'Create Shift Handover',
      layer: 'compound',
      purpose: 'Create a time-bound handover that references unresolved records from their owning capabilities.',
      evidence: ['Kitchen-local period', 'author', 'recipient scope', 'linked records', 'notes', 'acknowledgement'],
      authority: 'Team owns the handover envelope; every linked operational record retains its owner.',
      approval: 'Publishing and acknowledging a handover require explicit human actions.',
      status: 'requested',
    },
  ] satisfies KitchenTeamProposedTool[],
  aiContract: {
    teamAI: [
      'Use only the selected Kitchen Team and authorized member records.',
      'Use the five registered Team Tools according to their input, confirmation and result contracts.',
      'Keep member identity, User identity, App membership and access distinct.',
      'Never infer competence, certification, availability, employment status, pay or performance.',
      'Treat proposed competence, training and handover Tools as unavailable.',
    ],
    kitchenAI: [
      'Recognise Kitchen Team intent and delegate it to TeamAI.',
      'Pass selected Kitchen, member selection and authorized user request.',
      'Route Station, Food Safety and operational record questions to their owning specialists.',
      'Require confirmation for write and destructive Team Tools.',
    ],
  },
  currentDrift: [],
  conclusion:
    'Team is the Kitchen-owned roster, responsibility, competence-evidence and handover capability. Five bounded membership Tools work today; training, competence and handover remain requested until their records and authorization contracts exist.',
} as const
