import { EditorState } from '../store/useEditorStore'

export async function generatePreview(state: EditorState): Promise<string> {
  if (!state.sourceImage || !state.analysis) return ''

  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 800))

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) return state.sourceImage.src

  const { width, height } = state.sourceImage
  const src = state.aiImageUrl || state.sourceImage.src
  canvas.width = width
  canvas.height = height

  const img = new window.Image()
  img.crossOrigin = 'anonymous' // To avoid CORS issues if aiImageUrl is external
  img.src = src
  await new Promise((resolve) => {
    img.onload = resolve
  })

  // Apply basic filters mapping to enhancement settings
  let filterString = ''
  if (state.settings.enhancement.toneEnhancement) {
    filterString += 'contrast(1.1) '
  }
  if (state.settings.enhancement.lightColorCorrection) {
    filterString += 'saturate(1.05) brightness(1.02) '
  }
  ctx.filter = filterString.trim() || 'none'
  
  ctx.drawImage(img, 0, 0, width, height)

  // Clear filters for text & watermark
  ctx.filter = 'none'

  // Draw text replacements
  for (const region of state.analysis.textRegions) {
    if (region.hidden) continue

    const isHeadline = region.id === 'headline-1'
    const isSubtitle = region.id === 'subtitle-1'
    const isBadge = region.id === 'badge-plr'
    const isWatermarkMock = region.id === 'watermark-original'
    
    // Simulate removing @TasCreativeStudio since the global watermark covers it
    if (isWatermarkMock && state.settings.watermark.enabled) {
      ctx.fillStyle = '#dbdbe3' 
      ctx.fillRect(region.x, region.y, region.width, region.height)
      continue
    }

    // Define a smooth gradient mimicking the original pink background left-to-right
    const bgGrad = ctx.createLinearGradient(0, 0, width, 0)
    bgGrad.addColorStop(0.1, '#ffdce5')
    bgGrad.addColorStop(0.5, '#ffcad8')
    bgGrad.addColorStop(0.9, '#fbc3d1')

    // Purely erase the subtitle area with a seamless blurred overlay
    if (isSubtitle && state.settings.text.removeUnwanted) {
      ctx.save()
      ctx.filter = 'blur(15px)' // Soften edges to blend perfectly into background
      ctx.fillStyle = bgGrad
      ctx.fillRect(region.x - 20, region.y - 15, region.width + 40, region.height + 30)
      ctx.restore()
    }

    // Purely erase the badge area completely (including top ribbons at y=0)
    if (isBadge && state.settings.text.replacePlrResell) {
      ctx.save()
      ctx.filter = 'blur(18px)' // Soften edges
      ctx.fillStyle = bgGrad
      // Extend all the way up to 0 to catch the ribbon/string artifacts
      ctx.fillRect(region.x - 15, 0, region.width + 30, region.y + region.height + 15)
      ctx.restore()
    }

    // Replace the top headline area with a new crisp Bubble and Text
    if (isHeadline && state.settings.text.removeTemplyHeadline) {
      ctx.save()
      // Create a nice rounded white box covering the original headline
      ctx.fillStyle = '#ffffff'
      ctx.shadowColor = 'rgba(0, 0, 0, 0.08)'
      ctx.shadowBlur = 15
      ctx.shadowOffsetY = 4
      ctx.beginPath()
      ctx.roundRect(region.x, region.y, region.width, region.height, 22)
      ctx.fill()
      ctx.restore()

      // Draw standard CUTE DIGITAL PLANNER
      ctx.fillStyle = '#22222a'
      const fontSize = Math.floor(region.height * 0.42)
      ctx.font = `600 ${fontSize}px "Outfit", system-ui, sans-serif`
      ctx.letterSpacing = '6px'
      ctx.textBaseline = 'middle'
      ctx.textAlign = 'center'
      
      const cx = region.x + region.width / 2
      const cy = region.y + region.height / 2
      ctx.fillText("CUTE DIGITAL PLANNER", cx, cy)
    } 
  }

  // Draw Watermark
  if (state.settings.watermark.enabled) {
    ctx.save()
    ctx.textAlign = 'center'
    ctx.textBaseline = 'bottom'
    ctx.fillStyle = 'rgba(255, 255, 255, ' + (state.settings.watermark.opacity / 100) + ')'
    
    // Simulate emboss
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
    ctx.shadowBlur = state.settings.watermark.embossDepth / 10
    ctx.shadowOffsetX = 1
    ctx.shadowOffsetY = 1

    const fontSize = Math.max(20, (width * state.settings.watermark.size) / 1000)
    ctx.font = `bold ${fontSize}px sans-serif`
    
    let x = width / 2
    let y = height - 20
    if (state.settings.watermark.position === 'bottom-left') {
      ctx.textAlign = 'left'
      x = 20
    } else if (state.settings.watermark.position === 'bottom-right') {
      ctx.textAlign = 'right'
      x = width - 20
    }

    ctx.fillText('©TeemplySieStudio', x, y)
    ctx.restore()
  }

  return canvas.toDataURL('image/jpeg', 0.9)
}
