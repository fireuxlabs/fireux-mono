import type { FireuxStamped } from 'fireux-core/runtime/models/utils/stamps.model'
import type { CertificationItem, EducationItem, LanguageProficiency, OtherExperienceItem, ProjectItem, RelevantExperienceItem, VolunteeringItem } from './supporting'

export type { CertificationItem, EducationItem, ExperienceItem, LanguageProficiency, OtherExperienceItem, ProjectItem, RelevantExperienceItem, VolunteeringItem } from './supporting'
export type Professional = FireuxStamped & { id: string; kind: 'professional'; title: string; subtitle: string; tagline: string; summary: string; bio: string; image: string; positions: string[]; tags: string[]; relevant_experience: RelevantExperienceItem[]; other_experience: OtherExperienceItem[]; languages: LanguageProficiency[]; certifications: CertificationItem[]; education: EducationItem[]; volunteering: VolunteeringItem[]; projects: ProjectItem[] }
