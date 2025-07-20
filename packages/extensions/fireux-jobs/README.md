# 🏢 FireUX Jobs Module

Universal job management system for service industries, designed to work across cleaning, culinary, and other marketplace applications.

## 🚀 Features

- **Employer Profiles** - Company management and job posting
- **Professional Profiles** - Service worker profiles and applications
- **Route Integration** - Seamless dashboard navigation
- **Universal Design** - Works across cleaning and culinary platforms
- **Modular Architecture** - Optional 4.1kB module extension

## 📦 Installation

```bash
# Add to your Nuxt app
modules: ['fireux-jobs']

# Import routes for navigation
import { getJobRoutes } from 'fireux-jobs/composables'
const jobRoutes = getJobRoutes()
```

## 🔗 Integration

The Jobs module extends existing FireUX Core apps with job marketplace functionality while maintaining full backward compatibility.

## 📚 Documentation

- [`jobs.doc.md`](./jobs.doc.md) - Technical documentation and API reference
- [`jobs-business.doc.md`](./jobs-business.doc.md) - Business model and strategy
- [`jobs-copilot.doc.md`](./jobs-copilot.doc.md) - Development workflows and AI assistant guide

## ✅ Status

**Production Ready** - Currently live in CleanBox and MiseBox applications.

---

For detailed information, see the documentation files listed above.
