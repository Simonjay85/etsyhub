import { useEditorStore } from '@/lib/store/useEditorStore'
import { formatBytes } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { FileImage, Maximize, HardDrive } from 'lucide-react'

export function FileMetaCard() {
  const sourceImage = useEditorStore(state => state.sourceImage)

  if (!sourceImage) return null

  return (
    <Card className="rounded-xl shadow-sm border-border bg-card overflow-hidden">
      <div 
        className="w-full h-32 bg-gray-100 bg-cover bg-center" 
        style={{ backgroundImage: `url(${sourceImage.src})` }}
      />
      <CardContent className="p-4 space-y-3 relative text-sm">
        <div className="flex items-center gap-2">
          <FileImage className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium truncate" title={sourceImage.file.name}>{sourceImage.file.name}</span>
        </div>
        
        <div className="flex items-center justify-between text-muted-foreground">
          <div className="flex items-center gap-2">
            <Maximize className="w-4 h-4" />
            <span>{sourceImage.width} × {sourceImage.height}</span>
          </div>
          <div className="flex items-center gap-2">
            <HardDrive className="w-4 h-4" />
            <span>{formatBytes(sourceImage.file.size)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
