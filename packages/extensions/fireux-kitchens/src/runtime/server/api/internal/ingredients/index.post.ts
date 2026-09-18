import { defineEventHandler, readBody } from 'h3'
import { createIngredient } from '../../../../ingredient/server/curation.ts'
import { generateIngredientImage } from '../../../../ingredient/server/image-generation'

export default defineEventHandler(async (event) => {
  const ingredient = await createIngredient(event, await readBody(event))
  if (!ingredient.image_url) {
    const generation = generateIngredientImage(event, ingredient.id).catch(
      () => {
        console.warn(
          '[Ingredient image] Automatic generation failed; retry from Ingredient edit.'
        )
      }
    )
    // Keep serverless execution alive where the host has no background lifetime.
    if (import.meta.dev || event.context.waitUntil) event.waitUntil(generation)
    else await generation
  }
  return { ingredient }
})
