'use server'

/**
 * Nano Banana Pro API Integration Wrapper
 * 
 * This server action handles external image manipulation API calls.
 * Because API keys are secret, they must NEVER be exposed to the client.
 * 
 * Flow:
 * 1. Client uploads an image or sends base64/URL.
 * 2. Client sends coordinates or masks of what to erase.
 * 3. This action securely communicates with Nano Banana endpoints.
 * 4. Image is returned as a URL or Base64 string.
 */

export async function processImageWithNanoBanana(
  imageBase64: string,
  masks: { x: number, y: number, width: number, height: number }[],
  actionType: 'inpaint' | 'remove-text' = 'inpaint'
) {
  // 1. Verify environment configuration
  const API_KEY = process.env.NANO_BANANA_API_KEY
  
  if (!API_KEY) {
    console.warn("⚠️ NANO_BANANA_API_KEY is not defined in .env.local")
    // For local development mockup (if API key is missing),
    // we simulate network latency and return nothing or throw error
    await new Promise(res => setTimeout(res, 2500))
    throw new Error("Missing Nano Banana Pro API Key. Please add NANO_BANANA_API_KEY to .env.local")
  }

  try {
    // 2. Format Request Payload based on nananobanana.com documentation
    // In a real integration, we'd specify exactly the endpoint for their `inpaint` or `erase` APIs.
    const endpoint = 'https://api.nananobanana.com/v1/image/' + actionType
    
    // We assume Nano Banana accepts standard multiform data or JSON with base64
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: imageBase64,
        mask_regions: masks,
        // Optional parameters (e.g., prompt for generative fill)
        prompt: actionType === 'inpaint' ? 'seamless background texture, solid color padding' : '',
        negative_prompt: 'artifacts, text, watermark'
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Failed to process AI image')
    }

    const data = await response.json()
    // 3. Return successfully processed image URL
    return {
      success: true,
      resultImageUrl: data.output_url || data.result // Based on their schema
    }

  } catch (error: any) {
    console.error("Nano Banana API Error:", error.message)
    throw new Error(error.message || "An unexpected error occurred while communicating with Nano Banana Pro.")
  }
}
