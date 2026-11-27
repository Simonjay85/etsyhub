import { ImageAnalysisResult } from '../store/useEditorStore'

export type RecommendationItem = {
  id: string
  severity: 'info' | 'suggestion' | 'warning'
  label: string
}

export function generateRecommendations(analysis: ImageAnalysisResult): RecommendationItem[] {
  const recs: RecommendationItem[] = []
  const minSide = Math.min(analysis.width, analysis.height)

  if (minSide < 2000) {
    recs.push({
      id: 'rec-upscale',
      severity: minSide < 1000 ? 'warning' : 'suggestion',
      label: `Image is ${analysis.width}×${analysis.height}px. Etsy recommends at least 2000px on the shortest side; consider upscaling.`
    })
  }

  if (analysis.brightness !== 'normal') {
    recs.push({
      id: 'rec-brightness',
      severity: 'suggestion',
      label: analysis.brightness === 'dark'
        ? 'Image looks dark. Light & color correction may help.'
        : 'Image looks very bright. Check that details are not washed out.'
    })
  }

  const ratio = analysis.aspectRatio
  if (Math.abs(ratio - 4 / 3) > 0.05 && Math.abs(ratio - 1) > 0.05 && Math.abs(ratio - 5 / 4) > 0.05) {
    recs.push({
      id: 'rec-ratio',
      severity: 'info',
      label: 'Etsy thumbnails crop best at 4:3, 5:4 or 1:1. Check how your main subject is framed.'
    })
  }

  return recs
}
