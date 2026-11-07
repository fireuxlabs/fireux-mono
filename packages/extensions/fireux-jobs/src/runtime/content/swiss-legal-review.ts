import type { FireuxMetaLegalNotice } from 'fireux-core/runtime/app/models/meta-content'

/** App-selected Swiss Jobs review notice for the shared Core Legal page. */
export const swissJobsLegalReview = {
  id: 'swiss-jobs-legal-review',
  jurisdiction: 'Switzerland',
  title: 'Swiss Jobs review',
  description:
    'Before paid or expanded Jobs activity launches in this App, obtain Swiss legal review. These are review points, not legal advice or confirmation of compliance.',
  items: [
    'Determine whether the paid Jobs activity requires a Swiss private-employment-placement or temporary-staffing licence.',
    'Check each vacancy against the current annual reporting list and enforce the RAV Job-Room reporting and five-working-day publication period where required.',
    'Verify that each person posting a job is authorised to represent the named employer.',
    'Define applicant-data access, retention, deletion, recipient, and cross-border processing requirements.',
    'Define the employer handoff for employment contracts, work permits, applicable GAV/NAV, working time, and social insurance.',
    'Validate each individual job page’s JobPosting structured data against the current posting and Google guidance.',
  ],
  sources: [
    {
      label: 'Swiss job registration requirements',
      to: 'https://www.arbeit.swiss/en/employers/faq-on-the-job-registration-requirement',
    },
    {
      label: 'Swiss recruitment and staffing licences',
      to: 'https://www.arbeit.swiss/en/employment-agencies/recruitment-and-staffing-agencies-in-switzerland',
    },
    {
      label: 'Google JobPosting guidelines',
      to: 'https://developers.google.com/search/docs/appearance/structured-data/job-posting',
    },
  ],
} satisfies FireuxMetaLegalNotice
