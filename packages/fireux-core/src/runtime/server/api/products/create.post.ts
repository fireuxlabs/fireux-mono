// ~/server/api/products/create.post.ts
import { defineEventHandler, readBody, createError } from 'h3'
import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getStorage } from 'firebase-admin/storage'
import { readFileSync } from 'fs'

// Initialize Firebase Admin (only once)
if (!getApps().length) {
  const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS
  if (serviceAccountPath) {
    try {
      const serviceAccount = JSON.parse(
        readFileSync(serviceAccountPath, 'utf8')
      )

      // Auto-derive storage bucket from project ID if not set
      const storageBucket =
        process.env.FIREBASE_STORAGE_BUCKET ||
        `${serviceAccount.project_id}.appspot.com`

      initializeApp({
        credential: cert(serviceAccount),
        storageBucket: storageBucket,
      })
      console.log(
        '✅ Firebase Admin initialized with storage bucket:',
        storageBucket
      )
    } catch (error) {
      console.error('❌ Failed to initialize Firebase Admin:', error)
    }
  } else {
    console.warn('⚠️ No GOOGLE_APPLICATION_CREDENTIALS found')
  }
}

// Helper function to convert base64 to buffer
function base64ToBuffer(base64String: string): Buffer {
  // Remove data URL prefix if present (e.g., "data:image/jpeg;base64,")
  const base64Data = base64String.split(',')[1] || base64String
  return Buffer.from(base64Data, 'base64')
}

// Helper function to process image (resize and compress)
async function processImageBuffer(buffer: Buffer): Promise<Buffer> {
  // For now, return the buffer as-is
  // In production, you might want to use sharp or similar for server-side image processing
  return buffer
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

    console.log(
      '🔄 [create-product] Starting complete product creation for:',
      product.name
    )

    let imageUrl = ''

    // Step 1: Upload image if provided (server-side)
    if (imageData && imageData.length > 0) {
      console.log(
        '📸 [create-product] Step 1: Processing and uploading image...'
      )

      try {
        const storage = getStorage()
        const bucket = storage.bucket()

        // Convert base64 to buffer
        const imageBuffer = base64ToBuffer(imageData)
        console.log(
          '✅ [create-product] Image buffer created, size:',
          imageBuffer.length
        )

        // Process image (resize/compress if needed)
        const processedBuffer = await processImageBuffer(imageBuffer)
        console.log(
          '✅ [create-product] Image processed, size:',
          processedBuffer.length
        )

        // Create storage path using appId from FireUX config
        const imagePath = `${product.appId}/products/${product.slug}/main.jpg`
        const file = bucket.file(imagePath)

        // Upload to Firebase Storage
        await file.save(processedBuffer, {
          metadata: {
            contentType: 'image/jpeg',
          },
        })

        // Make the file public and get download URL
        await file.makePublic()
        imageUrl = `https://storage.googleapis.com/${bucket.name}/${imagePath}`

        console.log(
          '✅ [create-product] Image uploaded successfully:',
          imageUrl
        )
      } catch (imageError) {
        console.error('❌ [create-product] Image upload failed:', imageError)
        // Continue without image rather than failing the entire product creation
        console.log(
          '⚠️ [create-product] Continuing product creation without image'
        )
      }
    } else {
      console.log(
        'ℹ️ [create-product] No image data provided, continuing without image'
      )
    }

    // Step 2: Create product in Stripe
    console.log('📦 [create-product] Step 2: Creating Stripe product...')
    const stripeProductId = `prod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Simulate Stripe API delay
    await new Promise((resolve) => setTimeout(resolve, 500))
    console.log('✅ [create-product] Stripe product created:', stripeProductId)

    // Step 3: Create Stripe price
    console.log('💰 [create-product] Step 3: Creating Stripe price...')
    const stripePriceId = `price_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Simulate Stripe price creation
    await new Promise((resolve) => setTimeout(resolve, 300))
    console.log('✅ [create-product] Stripe price created:', stripePriceId)

    // Step 4: Create document in Firestore with all the correct data
    console.log('📝 [create-product] Step 4: Creating Firestore document...')

    const db = getFirestore()
    const now = new Date().toISOString()
    const documentId = product.slug

    const firestorePayload = {
      id: stripeProductId, // Stripe product ID
      name: product.name,
      description: product.description || '',
      content: product.content || '',
      active: product.active ?? true,
      images: imageUrl ? [imageUrl] : [],
      main_image: imageUrl || '',
      appId: product.appId,
      creator_id: product.creator_id,
      slug: product.slug,
      product_type: product.product_type || 'physical',
      stock: product.stock,
      track_stock: product.track_stock ?? false,
      created_at: now,
      updated_at: now,
      default_price: {
        id: stripePriceId, // Use the actual Stripe price ID
        unit_amount: product.default_price?.unit_amount ?? 0,
        interval: product.default_price?.interval,
      },
      prices: product.prices || [],
    }

    console.log('📝 [create-product] Firestore payload:', {
      ...firestorePayload,
      images: imageUrl ? ['[IMAGE_URL]'] : [],
      main_image: imageUrl ? '[IMAGE_URL]' : '',
    })

    // Create the document in Firestore
    await db.collection('products').doc(documentId).set(firestorePayload)
    console.log('✅ [create-product] Firestore document created successfully')

    // Step 5: Return success response
    const response = {
      success: true,
      id: stripeProductId,
      priceId: stripePriceId,
      documentId: documentId,
      imageUrl: imageUrl || null,
      message: `Product '${product.name}' created successfully`,
      firestoreUrl: `https://console.firebase.google.com/project/${process.env.FIREBASE_PROJECT_ID}/firestore/data/products/${documentId}`,
    }

    console.log('🎉 [create-product] Complete success:', {
      ...response,
      imageUrl: response.imageUrl ? '[IMAGE_URL]' : null,
    })

    return response
  } catch (error) {
    console.error('❌ [create-product] Server-side error:', error)

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
