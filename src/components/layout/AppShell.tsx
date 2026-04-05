"use client"

import { TopBar } from './TopBar'
import { LeftSidebar } from './LeftSidebar'
import { RightInspector } from './RightInspector'
import { PreviewCanvas } from '../canvas/PreviewCanvas'
import { BatchResultsGrid } from '../canvas/BatchResultsGrid'
import { useEditorStore } from '@/lib/store/useEditorStore'

export function AppShell() {
  const sourceImage = useEditorStore((state) => state.sourceImage)
  const batchMockups = useEditorStore((state) => state.batchMockups)
  const productStyle = useEditorStore((state) => state.productStyle)
  const images = useEditorStore((state) => state.images)

  return (
    <div className="flex h-full w-full flex-col bg-background text-foreground overflow-hidden rounded-xl border">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        <LeftSidebar />
        
        <main className="flex-1 overflow-hidden relative bg-secondary/30">
          {batchMockups.length > 0 ? (
            <BatchResultsGrid />
          ) : sourceImage ? (
            <PreviewCanvas />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-muted-foreground p-8">
              <div className="text-center max-w-sm">
                {productStyle === 'planner-utility' ? (
                  <>
                    <div className="text-5xl mb-4">🗂️</div>
                    <h3 className="text-lg font-medium mb-2 text-orange-400">Planner Utility Mode</h3>
                    <p className="text-sm">Upload <strong>2 or more pages</strong> of your product on the left panel. The system will generate Fan, Grid and Diagonal collection mockups automatically.</p>
                    {images.length > 0 && <p className="text-xs mt-3 text-orange-300">{images.length} image{images.length !== 1 ? 's' : ''} ready ✓ — press Generate!</p>}
                  </>
                ) : (
                  <>
                    <h3 className="text-lg font-medium mb-2">No Image Selected</h3>
                    <p className="text-sm">Upload an image from the left panel to begin editing.</p>
                  </>
                )}
              </div>
            </div>
          )}
        </main>
        
        {sourceImage && <RightInspector />}
      </div>
    </div>
  )
}
