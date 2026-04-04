import { useCallback } from 'react'
import { useDropzone, FileRejection } from 'react-dropzone'
import { UploadCloud } from 'lucide-react'
import { useEditorStore, ImageItem } from '@/lib/store/useEditorStore'
import { toast } from 'sonner' 

export function UploadArea() {
  const { addImages } = useEditorStore()
  
  const onDrop = useCallback(async (acceptedFiles: File[], fileRejections: FileRejection[]) => {
    if (fileRejections.length > 0) {
      toast.error('File rejected', { description: 'Please upload valid images (JPG, PNG, WEBP) under 20MB.' })
      return
    }

    if (acceptedFiles.length === 0) return

    toast.info(`Processing ${acceptedFiles.length} image(s)...`)

    const newItems: ImageItem[] = await Promise.all(
      acceptedFiles.map(async (file): Promise<ImageItem> => {
        const src = URL.createObjectURL(file)
        const img = new window.Image()
        img.src = src
        await new Promise((resolve) => { img.onload = resolve })
        return { 
          id: Math.random().toString(36).substr(2, 9), 
          file, 
          src, 
          width: img.width, 
          height: img.height 
        }
      })
    )
    
    addImages(newItems)
    toast.success(`${newItems.length} image(s) uploaded successfully.`)
  }, [addImages])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpeg', '.jpg'],
      'image/png': ['.png'],
      'image/webp': ['.webp']
    },
    maxSize: 20 * 1024 * 1024,
    multiple: true
  })

  return (
    <div 
      {...getRootProps()} 
      className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
        isDragActive ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/20' : 'border-border hover:border-indigo-300 hover:bg-muted/50'
      }`}
    >
      <input {...getInputProps()} />
      <UploadCloud className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
      <p className="text-sm font-medium">Drag & drop your PLR images</p>
      <p className="text-xs text-muted-foreground mt-1">Supports JPG, PNG, WEBP up to 20MB.</p>
    </div>
  )
}
