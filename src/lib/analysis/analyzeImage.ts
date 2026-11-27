import { ImageAnalysisResult } from '../store/useEditorStore'

function measureBrightness(imageSrc: string): Promise<ImageAnalysisResult['brightness']> {
  return new Promise(resolve => {
    const img = new Image()
    img.onload = () => {
      try {
        const size = 32
        const canvas = document.createElement('canvas')
        canvas.width = size
        canvas.height = size
        const ctx = canvas.getContext('2d')
        if (!ctx) return resolve('normal')
        ctx.drawImage(img, 0, 0, size, size)
        const { data } = ctx.getImageData(0, 0, size, size)
        let total = 0
        for (let i = 0; i < data.length; i += 4) {
          total += 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]
        }
        const avg = total / (data.length / 4)
        resolve(avg < 70 ? 'dark' : avg > 200 ? 'bright' : 'normal')
      } catch {
        resolve('normal')
      }
    }
    img.onerror = () => resolve('normal')
    img.src = imageSrc
  })
}

// Text detection (OCR) is not implemented, so no text regions are reported.
export async function analyzeImage(_file: File, imageSrc: string, width: number, height: number): Promise<ImageAnalysisResult> {
  const brightness = await measureBrightness(imageSrc)
  const minSide = Math.min(width, height)

  return {
    width,
    height,
    aspectRatio: width / height,
    sharpness: minSide < 1000 ? 'low' : minSide < 2000 ? 'medium' : 'high',
    brightness,
    textRegions: [],
    watermarkPlacement: 'bottom-center'
  }
}
