import { useEffect } from 'react'
import { UploadArea } from '../upload/UploadArea'
import { FileMetaCard } from '../upload/FileMetaCard'
import { ImageGallery } from '../upload/ImageGallery'
import { useEditorStore } from '@/lib/store/useEditorStore'
import { analyzeImage } from '@/lib/analysis/analyzeImage'
import { toast } from 'sonner'

export function LeftSidebar() {
  const { sourceImage, analysis, setAnalysis } = useEditorStore()

  useEffect(() => {
    let active = true
    if (sourceImage && !analysis) {
      toast.promise(
        analyzeImage(sourceImage.file, sourceImage.src, sourceImage.width, sourceImage.height),
        {
          loading: 'Analyzing image...',
          success: (res) => {
            if (active) setAnalysis(res)
            return 'Analysis complete'
          },
          error: 'Analysis failed'
        }
      )
    }
    return () => { active = false }
  }, [sourceImage, analysis, setAnalysis])

  return (
    <aside className="w-80 border-r bg-card flex flex-col shrink-0 overflow-y-auto">
      <div className="p-4 space-y-6">
        <div>
          <h2 className="text-sm font-semibold mb-3 tracking-tight">Upload</h2>
          <UploadArea />
        </div>
        
        <ImageGallery />

        {sourceImage && (
          <div>
            <h2 className="text-sm font-semibold mb-3 tracking-tight">Active Image Properties</h2>
            <FileMetaCard />
          </div>
        )}
      </div>
    </aside>
  )
}
