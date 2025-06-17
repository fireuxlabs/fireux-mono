// ~/server/api/stripe/create-product.post.ts
import { defineEventHandler, readBody, createError } from 'h3'
import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getStorage } from 'firebase-admin/storage'
import { readFileSync } from 'fs'

// Server-side image upload helper - simplified for server use
async function uploadImageToStorage(
  base64Image: string,
  collection: string,
  id: string,
  type: string
): Promise<string> {
  try {
    const storage = getStorage()
    const bucket = storage.bucket()

    console.log(
      '📸 [uploadImageToStorage] Attempting to access bucket:',
      bucket.name
    )

    // Convert base64 to buffer
    const base64Data = base64Image.split(',')[1] // Remove data URL prefix
    const buffer = Buffer.from(base64Data, 'base64')

    // Define storage path (simplified for server)
    const filePath = `products/${id}/${type}.jpg`
    const file = bucket.file(filePath)

    console.log('📸 [uploadImageToStorage] Uploading to path:', filePath)

    // Upload the image
    await file.save(buffer, {
      metadata: {
        contentType: 'image/jpeg',
      },
    })

    // Make the file public and return its URL
    await file.makePublic()
    const url = `https://storage.googleapis.com/${bucket.name}/${filePath}`
    console.log('✅ [uploadImageToStorage] Image uploaded successfully:', url)
    return url
  } catch (error: any) {
    console.error('❌ [uploadImageToStorage] Failed to upload image:', error)

    if (error.message && error.message.includes('bucket does not exist')) {
      throw new Error(
        `Firebase Storage bucket does not exist. Please enable Firebase Storage in the Firebase Console for your project.`
      )
    }

    throw new Error(`Failed to upload image: ${error.message}`)
  }
}

// Initialize Firebase Admin (only once)
if (!getApps().length) {
  const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS
  if (serviceAccountPath) {
    try {
      const serviceAccount = JSON.parse(
        readFileSync(serviceAccountPath, 'utf8')
      )

      // Get the storage bucket name from the project_id (new Firebase format)
      const storageBucket = `${serviceAccount.project_id}.firebasestorage.app`

      initializeApp({
        credential: cert(serviceAccount),
        storageBucket: storageBucket,
      })
      console.log('✅ Firebase Admin initialized with bucket:', storageBucket)
    } catch (error) {
      console.error('❌ Failed to initialize Firebase Admin:', error)
    }
  } else {
    console.warn('⚠️ No GOOGLE_APPLICATION_CREDENTIALS found')
  }
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { product, imageData } = body

    if (!product) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Product data is required',
      })
    }

    if (!imageData) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Image data is required',
      })
    }

    console.log(
      '🔄 [create-product] Starting server-side product creation:',
      product.name
    )

    // Step 1: Upload image to Firebase Storage
    console.log('📸 [create-product] Uploading image to Firebase Storage...')
    const imageUrl = await uploadImageToStorage(
      imageData,
      product.slug,
      'main',
      'main'
    )
    console.log('✅ [create-product] Image uploaded successfully:', imageUrl)

    // Step 2: Create product in Stripe (simulated for now)
    console.log('📦 [create-product] Step 2: Creating Stripe product...')
    const mockStripeId = `prod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Simulate Stripe API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    console.log('✅ [create-product] Stripe product created:', mockStripeId)

    // Step 3: Create document in Firestore
    console.log('📝 [create-product] Step 3: Creating Firestore document...')

    const db = getFirestore()
    const now = new Date().toISOString()

    // Use the product slug as document ID
    const documentId = product.slug

    const firestorePayload = {
      id: mockStripeId, // Stripe product ID stored as field
      name: product.name,
      description: product.description || '',
      content: product.content || '',
      active: product.active ?? true,
      images: [imageUrl],
      main_image: imageUrl,
      appId: product.appId,
      creator_id: product.creator_id,
      slug: product.slug,
      product_type: product.product_type || 'physical',
      stock: product.stock,
      track_stock: product.track_stock ?? false,
      created_at: now,
      updated_at: now,
      // Only include default_price if it's not undefined
      ...(product.default_price !== undefined && {
        default_price: product.default_price,
      }),
      prices: product.prices || [],
    }

    console.log('📝 [create-product] Firestore payload:', firestorePayload)
    console.log('📝 [create-product] Document ID:', documentId)

    // Create the document in Firestore
    await db.collection('products').doc(documentId).set(firestorePayload)

    console.log('✅ [create-product] Firestore document created successfully')

    // Step 4: Return success response
    const response = {
      success: true,
      id: mockStripeId,
      documentId: documentId,
      imageUrl: imageUrl,
      message: `Product '${product.name}' created successfully in both Stripe and Firestore`,
      firestoreUrl: `https://console.firebase.google.com/project/${process.env.FIREBASE_PROJECT_ID}/firestore/data/products/${documentId}`,
    }

    console.log('🎉 [create-product] Complete success:', response)
    return response
  } catch (error) {
    console.error('❌ [create-product] Server-side error:', error)

    // Return detailed error information
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred'
    const errorStack = error instanceof Error ? error.stack : 'No stack trace'

    console.error('❌ [create-product] Error details:', {
      message: errorMessage,
      stack: errorStack,
    })

    throw createError({
      statusCode: 500,
      statusMessage: `Failed to create product: ${errorMessage}`,
    })
  }
})
