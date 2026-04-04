import { ImageAnalysisResult } from '../store/useEditorStore'

export async function analyzeImage(file: File, imageSrc: string, width: number, height: number): Promise<ImageAnalysisResult> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500))

  return {
    width,
    height,
    aspectRatio: width / height,
    sharpness: 'medium',
    brightness: 'normal',
    textRegions: [
      {
        id: 'headline-1',
        originalText: 'PLR RESELL DIGITAL PLANNER',
        replacementText: 'DIGITAL PLANNER',
        x: width * 0.18,
        y: height * 0.05,
        width: width * 0.64,
        height: height * 0.09,
        confidence: 0.99,
        hidden: false
      },
      {
        id: 'subtitle-1',
        originalText: 'READY TO EDIT, REBRAND & RESELL AS YOUR OWN',
        replacementText: '',
        x: width * 0.15,
        y: height * 0.14,
        width: width * 0.7,
        height: height * 0.045,
        confidence: 0.98,
        hidden: false
      },
      {
        id: 'badge-plr',
        originalText: 'PLR RESELL Badge',
        replacementText: '',
        x: width * 0.63,
        y: height * 0.16,
        width: width * 0.18,
        height: height * 0.35,
        confidence: 0.96,
        hidden: false
      },
      {
        id: 'watermark-original',
        originalText: '@TasCreativeStudio',
        replacementText: '',
        x: width * 0.52,
        y: height * 0.85,
        width: width * 0.2,
        height: height * 0.05,
        confidence: 0.95,
        hidden: false
      }
    ],
    watermarkPlacement: 'bottom-center'
  }
}
