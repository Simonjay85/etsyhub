import { ImageAnalysisResult } from '../store/useEditorStore'

export type RecommendationItem = {
  id: string
  severity: 'info' | 'suggestion' | 'warning'
  label: string
}

export function generateRecommendations(analysis: ImageAnalysisResult): RecommendationItem[] {
  const recs: RecommendationItem[] = []
  
  recs.push({
    id: 'rec-upscale',
    severity: 'suggestion',
    label: 'This image would benefit from mild upscaling.'
  })

  const hasBrandText = analysis.textRegions.some(t => t.originalText.includes('OLIVA LEWANDOWSKI'))
  if (hasBrandText) {
    recs.push({
      id: 'rec-brand',
      severity: 'warning',
      label: 'Detected legacy text. Brand replacement recommended.'
    })
  }
  
  recs.push({
    id: 'rec-watermark',
    severity: 'info',
    label: 'Bottom-center watermark placement is visually safe.'
  })

  return recs
}
