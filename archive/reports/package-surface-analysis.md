# FireUX Package Surface Analysis Report

Generated: 2025-08-30T12:26:09.217Z

## Overview

This report scans all packages in the FireUX monorepo to analyze:
- ✅ **Exported APIs**: What each package officially provides
- 📁 **Implementation Files**: What's actually implemented in src/
- 🔗 **Cross-Package Imports**: How packages depend on each other
- ⚠️  **Deep Imports**: Direct imports into /src (potential issues)
- 🏥 **Health Score**: Package quality metrics (0-100)

## Summary Table

| Package | Score | Exports | Files | Deep Imports |
|---------|-------|---------|-------|--------------|
| fireux-core | 65/100 | main, runtime/*, models/*, server/* | 228 | 0 |
| fireux-jobs | 60/100 | main, composables | 48 | 0 |
| fireux-places | 60/100 | main, composables | 11 | 0 |
| fireux-cleanbox | 60/100 | main, composables | 11 | 0 |
| fireux-misebox | 60/100 | main, composables | 86 | 0 |


## 📦 fireux-core

**Version**: 0.1.0  
**Path**: `packages/core/fireux-core`  
**Health Score**: 65/100

### Health Score Breakdown
- +15 runtime exports
- +10 models exports
- -10 large package (>200 files)
- +30 base package

### Exported APIs

- `.` → `./src/module.ts`
- `./runtime/*` → `./src/runtime/*`
- `./models/*` → `./src/runtime/models/*`
- `./server/*` → `./src/runtime/server/*`

⚠️  **Missing export patterns**: config/*

### Implementation Files (228 files)

- **.ts**: 113 files
- **.vue**: 115 files

⚠️  **Large package warning**: 228 files may indicate need for splitting

---

## 📦 fireux-jobs

**Version**: 0.1.0  
**Path**: `packages/extensions/fireux-jobs`  
**Health Score**: 60/100

### Health Score Breakdown
- +10 composables exports
- +20 manageable size
- +30 base package

### Exported APIs

- `.` → `./src/module.ts`
- `./composables` → `./src/runtime/composables/*`

⚠️  **Missing export patterns**: runtime/*, models/*, config/*

### Implementation Files (48 files)

- **.ts**: 24 files
- **.vue**: 24 files

---

## 📦 fireux-places

**Version**: 0.1.0  
**Path**: `packages/extensions/fireux-places`  
**Health Score**: 60/100

### Health Score Breakdown
- +10 composables exports
- +20 manageable size
- +30 base package

### Exported APIs

- `.` → `./src/module.ts`
- `./composables` → `./src/runtime/composables/*`

⚠️  **Missing export patterns**: runtime/*, models/*, config/*

### Implementation Files (11 files)

- **.ts**: 8 files
- **.vue**: 3 files

---

## 📦 fireux-cleanbox

**Version**: 0.1.0  
**Path**: `packages/tenants/fireux-cleanbox`  
**Health Score**: 60/100

### Health Score Breakdown
- +10 composables exports
- +20 manageable size
- +30 base package

### Exported APIs

- `.` → `./src/module.ts`
- `./composables` → `./src/runtime/composables/*`

⚠️  **Missing export patterns**: runtime/*, config/*

### Implementation Files (11 files)

- **.ts**: 8 files
- **.vue**: 3 files

---

## 📦 fireux-misebox

**Version**: 0.1.0  
**Path**: `packages/tenants/fireux-misebox`  
**Health Score**: 60/100

### Health Score Breakdown
- +10 composables exports
- +20 manageable size
- +30 base package

### Exported APIs

- `.` → `./src/module.ts`
- `./composables` → `./src/runtime/composables/*`

⚠️  **Missing export patterns**: runtime/*, models/*, config/*

### Implementation Files (86 files)

- **.ts**: 43 files
- **.vue**: 43 files

---
