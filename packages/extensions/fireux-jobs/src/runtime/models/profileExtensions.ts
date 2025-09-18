// Additional optional fields used by the Jobs extension that are not part of the core profile models

export interface EmployerJobsProfileExtension {
  company_name?: string
  email?: string
  business_type?: string
  website?: string
  employee_count?: number
  years_established?: number
}

export interface ProfessionalJobsProfileExtension {
  professional_name?: string
  email?: string
  languages?: any[]
  kitchen_experience?: any[]
  education?: any[]
}
