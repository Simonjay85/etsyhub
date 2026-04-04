import { useEffect } from 'react'
import { useEditorStore } from '@/lib/store/useEditorStore'
import { generatePreview } from '@/lib/image/generatePreview'
import { CompareSlider } from './CompareSlider'
import { Loader2 } from 'lucide-react'

export function PreviewCanvas() {
  const store = useEditorStore()
  
  useEffect(() => {
    let active = true
    
    if (store.sourceImage && store.analysis) {
      store.setPreview('generating')
      generatePreview(store).then(src => {
        if (active) store.setPreview('success', src)
      }).catch(() => {
        if (active) store.setPreview('error')
      })
    }
    
    return () => { active = false }
  }, [
    // We intentionally deep-watch settings JSON to trigger regeneration
    store.sourceImage, store.analysis, 
    JSON.stringify(store.settings)
  ])

  return (
    <div className="h-full w-full relative flex items-center justify-center p-8 bg-black/5">
      <div className="w-full h-full border border-border/50 rounded-2xl bg-[#fafafa] bg-[url('https://transparenttextures.com/patterns/cubes.png')] shadow-inner flex items-center justify-center overflow-hidden relative drop-shadow-sm">
        
        {store.preview.status === 'generating' && (
          <div className="absolute inset-0 bg-background/50 flex flex-col items-center justify-center z-50 rounded-2xl backdrop-blur-sm transition-all duration-300">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
            <span className="font-medium text-sm text-foreground">Rendering preview...</span>
          </div>
        )}

        <div className="relative w-full h-full max-w-[80vw] max-h-[80vh] flex items-center justify-center pointer-events-auto">
          <CompareSlider />
        </div>
      </div>
    </div>
  )
}
