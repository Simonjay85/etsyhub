import { useEditorStore } from '@/lib/store/useEditorStore'
import { Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export function ImageGallery() {
  const { images, activeImageId, setActiveImage, removeImage } = useEditorStore()

  if (images.length === 0) return null

  return (
    <div className="mt-6 flex flex-col pt-6 border-t">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold tracking-tight">Gallery ({images.length})</h2>
      </div>
      
      <div className="grid grid-cols-3 gap-2">
        {images.map((img) => {
          const isActive = img.id === activeImageId
          return (
            <div 
              key={img.id}
              onClick={() => !isActive && setActiveImage(img.id)}
              className={cn(
                "group relative aspect-square rounded-lg border-2 cursor-pointer overflow-hidden transition-all",
                isActive ? "border-indigo-500 shadow-sm" : "border-border hover:border-indigo-300"
              )}
            >
              <img 
                src={img.src} 
                alt={img.file.name} 
                className="w-full h-full object-cover"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  removeImage(img.id)
                }}
                className="absolute top-1 right-1 p-1 bg-black/60 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
