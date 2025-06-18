# FireUX Jobs

A comprehensive job posting and application system for FireUX applications.

## Features

- 📝 **Job Posting** - Create and manage job listings
- 🔍 **Job Search** - Advanced search and filtering capabilities
- 📋 **Applications** - Handle job applications and candidate management
- 👥 **User Profiles** - Employer and job seeker profiles
- 📊 **Analytics** - Track application metrics and job performance

## Installation

```bash
pnpm add fireux-jobs
```

## Usage

Add to your `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  modules: ['fireux-jobs'],
  fireuxJobs: {
    posting: true,
    applications: true,
    search: true,
    collections: {
      jobs: 'jobs',
      applications: 'job_applications',
      employers: 'employers',
      jobSeekers: 'job_seekers',
    },
  },
})
```

## Components

### Job Components

- `<JobCard>` - Display job information
- `<JobPostingForm>` - Create/edit job postings
- `<JobSearch>` - Search and filter jobs

### Application Components

- `<JobApplicationForm>` - Apply for jobs
- `<JobApplicationsList>` - Manage applications

### Dashboard Components

- `<EmployerDashboard>` - Employer management interface
- `<JobSeekerDashboard>` - Job seeker interface

## Composables

### useJobs()

```typescript
const { jobs, loading, createJob, updateJob, deleteJob, searchJobs } = useJobs()
```

### useJobApplications()

```typescript
const {
  applications,
  applyForJob,
  getMyApplications,
  updateApplicationStatus,
} = useJobApplications()
```

### useJobSearch()

```typescript
const { searchResults, filters, search, clearFilters } = useJobSearch()
```

### useEmployer()

```typescript
const { employer, createEmployerProfile, updateEmployerProfile } = useEmployer()
```

### useJobSeeker()

```typescript
const { profile, createProfile, updateProfile, uploadResume } = useJobSeeker()
```

## Job Categories

### CleanBox (Cleaning Industry)

- Residential Cleaning
- Commercial Cleaning
- Deep Cleaning
- Move-in/Move-out Cleaning
- Post-Construction Cleaning
- Window Cleaning
- Carpet Cleaning
- Janitorial Services

### MiseBox (Culinary Industry)

- Head Chef
- Sous Chef
- Line Cook
- Prep Cook
- Pastry Chef
- Kitchen Manager
- Food Service Worker
- Catering Staff
- Restaurant Manager
- Bartender
- Server
- Food Runner

## License

MIT
