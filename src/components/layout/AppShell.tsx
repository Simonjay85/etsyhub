"use client"

import { TopBar } from './TopBar'
import { LeftSidebar } from './LeftSidebar'
import { RightInspector } from './RightInspector'
import { PreviewCanvas } from '../canvas/PreviewCanvas'
import { useEditorStore } from '@/lib/store/useEditorStore'

export function AppShell() {
  const sourceImage = useEditorStore((state) => state.sourceImage)

  return (
    <div className="flex h-full w-full flex-col bg-background text-foreground overflow-hidden rounded-xl border">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        <LeftSidebar />
        
        <main className="flex-1 overflow-hidden relative bg-secondary/30">
          {sourceImage ? (
            <PreviewCanvas />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-muted-foreground p-8">
              <div className="text-center max-w-sm">
                <h3 className="text-lg font-medium mb-2">No Image Selected</h3>
                <p className="text-sm">Upload an image from the left panel to begin editing.</p>
              </div>
            </div>
          )}
        </main>
        
        {sourceImage && <RightInspector />}
      </div>
    </div>
  )
}
