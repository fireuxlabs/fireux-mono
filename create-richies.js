#!/usr/bin/env node

/**
 * Create richies-reinigung tenant
 */

import fs from 'fs'
import { execSync } from 'child_process'

const config = {
  parentSystem: 'cleanbox',
  tenantName: 'richies-reinigung',
  port: '3002',
  primaryColor: 'blue',
  secondaryColor: 'slate',
  parentPath: 'projects/cleanbox/cleanbox-app',
  tenantPath: 'projects/cleanbox/richies-reinigung',
  modules: ['fireux-core', 'fireux-cleanbox'],
}

function createTenant(config) {
  console.log(`Creating ${config.tenantName}...`)

  // Create tenant directory
  execSync(`mkdir -p "${config.tenantPath}"`)

  // Copy files from parent (excluding node_modules and other build artifacts)
  execSync(
    `rsync -av --exclude 'node_modules' --exclude '.nuxt' --exclude 'dist' --exclude '.output' "${config.parentPath}/" "${config.tenantPath}/"`
  )

  // Update package.json
  const packagePath = `${config.tenantPath}/package.json`
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'))
  packageJson.name = `${config.tenantName}-app`
  fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2))

  // Update nuxt.config.ts
  const nuxtConfigPath = `${config.tenantPath}/nuxt.config.ts`
  let nuxtConfig = fs.readFileSync(nuxtConfigPath, 'utf8')

  // Update port and theme
  nuxtConfig = nuxtConfig.replace(
    /devServer:\s*{[^}]+}/,
    `devServer: {
    port: ${config.port}
  }`
  )

  nuxtConfig = nuxtConfig.replace(
    /css:\s*\[[^\]]+\]/,
    `css: [
    '@/assets/styles/themes/${config.primaryColor}-${config.secondaryColor}.css'
  ]`
  )

  fs.writeFileSync(nuxtConfigPath, nuxtConfig)

  console.log(`✅ Created ${config.tenantName} at ${config.tenantPath}`)
  console.log(`🌐 Port: ${config.port}`)
  console.log(`🎨 Theme: ${config.primaryColor}-${config.secondaryColor}`)
}

// Create the tenant
createTenant(config)

// Add script to root package.json
const rootPackagePath = 'package.json'
const rootPackage = JSON.parse(fs.readFileSync(rootPackagePath, 'utf8'))
rootPackage.scripts[`dev:${config.tenantName}`] =
  `pnpm --filter ${config.tenantName}-app dev`
fs.writeFileSync(rootPackagePath, JSON.stringify(rootPackage, null, 2))

console.log(`\n✅ Successfully created ${config.tenantName} tenant!`)
console.log(`🌐 Run: pnpm dev:${config.tenantName}`)
console.log(`📱 Open: http://localhost:${config.port}`)
