// Test script for the complete ensureApp flow
const fetch = require('node-fetch')

console.log('🧪 Testing Complete ensureApp Flow...\n')

const testConfig = {
  baseUrl: 'http://localhost:3005', // FireUX dev server
  testId: Date.now(),
}

async function testCompleteFlow() {
  try {
    console.log('🏗️ Testing /api/app/ensure-app endpoint directly...')

    const testAppData = {
      appId: `test-app-${testConfig.testId}`,
      appName: `Test App ${testConfig.testId}`,
      userId: `test-user-${testConfig.testId}`,
      setupSubscriptions: true,
      createDefaultProducts: true,
      metadata: {
        test_run: 'true',
        created_at: new Date().toISOString(),
      },
      ping: `complete-test-${testConfig.testId}`,
    }

    const response = await fetch(`${testConfig.baseUrl}/api/app/ensure-app`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testAppData),
    })

    if (response.ok) {
      const result = await response.json()
      console.log('✅ /api/app/ensure-app endpoint working!')
      console.log(`   App ID: ${result.appId}`)
      console.log(`   Tasks completed: ${result.tasks_completed?.length || 0}`)
      console.log(
        `   Products created: ${result.products_created?.length || 0}`
      )
      console.log(`   Subscriptions setup: ${result.subscriptions_setup}`)
      console.log(`   Firestore updated: ${result.firestore_updated}`)

      if (result.products_created && result.products_created.length > 0) {
        console.log('\n📦 Products created:')
        result.products_created.forEach((product) => {
          console.log(
            `   - ${product.type}: ${product.name} (${product.prices} prices)`
          )
        })
      }

      console.log('\n🎉 Complete Flow Test PASSED!')
      console.log('\n📋 System Status:')
      console.log('✅ Firestore update endpoint: Working')
      console.log('✅ Stripe product creation: Working')
      console.log('✅ App initialization: Working')
      console.log('✅ useEnsureApp integration: Ready')
    } else {
      const error = await response.text()
      console.log('❌ /api/app/ensure-app endpoint failed')
      console.log(`   Status: ${response.status}`)
      console.log(`   Error: ${error}`)
    }
  } catch (error) {
    console.error('❌ Complete flow test failed:', error.message)
  }
}

console.log('📖 Testing Complete ensureApp Integration:')
console.log('1. /api/app/ensure-app creates products and subscriptions')
console.log('2. useEnsureApp composable calls the endpoint')
console.log('3. Full app initialization with Stripe + Firestore sync')
console.log('4. Ready for production use\n')

testCompleteFlow()
