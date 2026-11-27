import { Button } from '@/components/ui/button'
import { Download, FolderOpen, Sparkles } from 'lucide-react'
import { useEditorStore } from '@/lib/store/useEditorStore'

export function TopBar() {
  const previewSrc = useEditorStore(state => state.preview.src)
  const hasWork = useEditorStore(state => state.images.length > 0 || state.batchMockups.length > 0)
  const reset = useEditorStore(state => state.reset)

  const handleNewProject = () => {
    if (!hasWork) return
    if (confirm('Start a new project? Uploaded images and generated mockups will be cleared.')) reset()
  }

  const handleExport = () => {
    if (!previewSrc) return
    const a = document.createElement('a')
    a.href = previewSrc
    a.download = 'temply-enhanced-design.jpg'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  return (
    <header className="h-14 border-b flex items-center justify-between px-4 bg-card shrink-0 shadow-sm z-10">
      <div className="flex items-center gap-2 text-primary font-medium">
        <Sparkles className="h-5 w-5 text-indigo-600" />
        <span>Design Assistant</span>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          disabled={!hasWork}
          title={hasWork ? 'Clear the current images and start over' : 'Upload an image to start a project'}
          onClick={handleNewProject}
        >
          <FolderOpen className="mr-2 h-4 w-4" /> New Project
        </Button>
        <Button 
          size="sm" 
          className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
          disabled={!previewSrc}
          onClick={handleExport}
        >
          <Download className="mr-2 h-4 w-4" /> Export
        </Button>
      </div>
    </header>
  )
}
